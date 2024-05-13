import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)
	const authModelName = authModel?.drizzleName || 'users'

	return `import { eq, and, isNull, gt } from 'drizzle-orm'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { Argon2id } from 'oslo/password'
import { decodeHex, encodeHex } from 'oslo/encoding'
import { TOTPController } from 'oslo/otp'
import { z } from 'zod'
import { TimeSpan } from 'lucia'
import { db } from '../../lib/db.js'
import { recoveryCodes, twoFactorTokens, ${authModelName} } from '../../schema.js'
import { rateLimit } from '../../middleware/rateLimit.js'
import { doLogin } from '../../middleware/authenticate.js'
import { verifyPassword } from '../../lib/password.js'
import { alphabet, generateRandomString, sha256 } from 'oslo/crypto'
import { createDate } from 'oslo'
import { send2faToken } from 'lib/email.js'

const create2faLoginToken = async (userId: string): Promise<string> => {
	await db
		.select()
		.from(twoFactorTokens)
		.where(eq(twoFactorTokens.userId, userId))

	const token = generateRandomString(6, alphabet('0-9'))

	const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)))

	await db.insert(twoFactorTokens).values({
		tokenHash,
		userId: userId,
		expiresAt: createDate(new TimeSpan(5, 'm')),
	})

	return token
}

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
			where: and(eq(${authModelName}.email, body.email), ${project.settings.auth.requireAccountConfirmation ? `eq(${authModelName}.emailVerified, true),` : ''} isNull(${authModelName}.deletedAt)),
		})

		if (user?.locked) {
			throw new HTTPException(401, { message: 'Account is locked' })
		}

		const email2faEnabled = ${project.settings.auth.enableEmail2fa ? 'true' : 'false'}
		const otpEnabled = user?.twoFactorSecret && user?.twoFactorEnabled

		// check if the password is correct
		const passwordIsCorrect = await verifyPassword(
			body.password,
			user?.password
		)

		// if it is...
		if (passwordIsCorrect && user) {
			// if the user has a form of 2fa enabled, and if there was no otp provided
			if (!body.otp && (otpEnabled || email2faEnabled)) {
				// if the user has 2fa enabled
				if (email2faEnabled) {
					const token = await create2faLoginToken(user.id)

					// we need to send them a token
					await send2faToken(user.email, token)
				}

				// then we need to tell the client they need to try again with an otp this time
				return c.json({ twoFactor: true })

				// otherwise
			} else if (body.otp) {
				let validOTP = false

				// if otp is enabled
				if (otpEnabled) {
					// lets check if it's a valid otp
					const verified = await new TOTPController().verify(
						body.otp,
						decodeHex(user.twoFactorSecret!) // this is determined by the otpEnabled check above
					)

					if (verified) validOTP = true
				}

				// if email2fa is enabled
				if (email2faEnabled) {
					const tokenHash = encodeHex(
						await sha256(new TextEncoder().encode(body.otp))
					)

					// lets check if it's a valid two factor token
					// to do this, we try to delete the token from the database
					const [result] = await db
						.delete(twoFactorTokens)
						.where(
							and(
								eq(twoFactorTokens.userId, user.id),
								eq(twoFactorTokens.tokenHash, tokenHash),
								gt(twoFactorTokens.expiresAt, new Date())
							)
						)

					// if the delete query affected one row, then the token was valid
					if (result.affectedRows === 1) validOTP = true
				}

				// if the otp is not valid
				if (!validOTP) {
					// we need to tell the client they need to try again with a valid otp
					throw new HTTPException(401, {
						message: 'Invalid two factor token',
					})
				}
			}

			return doLogin(c, user)
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
