import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)
	const authModelName = authModel?.drizzleName || 'users'

	return `import { eq, and, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { Argon2id } from 'oslo/password'
import { decodeHex } from 'oslo/encoding'
import { TOTPController } from 'oslo/otp'
import { z } from 'zod'
import { TimeSpan } from 'lucia'
import { db } from '../../lib/db.js'
import { recoveryCodes, ${authModelName} } from '../../schema.js'
import { rateLimit } from '../../middleware/rateLimit.js'
import { doLogin } from '../../middleware/authenticate.js'
import { verifyPassword } from '../../lib/password.js'

export const loginDTO = z.object({
	email: z.string(),
	password: z.string(),
	otp: z.string().optional(),
})

export const router = new Hono()

router.post(
	'/login',
	rateLimit(new TimeSpan(1, 'm'), 20),
	zValidator('json', loginDTO),
	async (c) => {
		const body: z.infer<typeof loginDTO> = await c.req.json()

		const user = await db.query.${authModelName}.findFirst({
			where: and(eq(${authModelName}.email, body.email), eq(${authModelName}.emailVerified, true), isNull(${authModelName}.deletedAt)),
		})

		if (user?.locked) {
			throw new HTTPException(401, { message: 'Account is locked' })
		}

		// check if the password is correct
		const passwordIsCorrect = await verifyPassword(
			body.password,
			user?.password
		)

		// if it is...
		if (passwordIsCorrect) {
			// if the user has two factor setup
			if (user && user.twoFactorSecret && user.twoFactorEnabled) {
				// if there was no otp provided
				if (!body.otp) {
					// then we need to tell the client they need to try again with an otp this time
					return c.json({ twoFactor: true })

					// otherwise
				} else {
					// lets check if it's a valid otp
					const validOTP = await new TOTPController().verify(
						body.otp,
						decodeHex(user.twoFactorSecret)
					)

					if (!validOTP) {
						throw new HTTPException(401, {
							message: 'Invalid two factor token',
						})
					}
				}
			}

			if (user) {
				return doLogin(c, user)
			}
		}

		// if the user exists, password was invalid, let's check if they have used a recovery code
		const codes = await db.query.recoveryCodes.findMany({
			where: eq(recoveryCodes.userId, user?.id || 'no-id'),
		})

		for (let i = 0; i < codes.length; i++) {
			const code = codes[i]

			if (!code) continue

			const codeIsValid = await new Argon2id().verify(
				code.codeHash,
				body.password
			)

			if (codeIsValid) {
				await db
					.delete(recoveryCodes)
					.where(eq(recoveryCodes.codeHash, code.codeHash))

				if (user) {
					return doLogin(c, user)
				}
			}
		}

		throw new HTTPException(401, { message: 'Invalid Credentials' })
	}
)
`
}

export default tmpl
