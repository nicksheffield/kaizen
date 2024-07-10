import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'
import { clean } from '@/generators/utils'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)
	const authModelName = authModel?.drizzleName || 'users'

	const magicLink = project.settings.auth.enableMagicLink

	return clean`import { eq, and, isNull, gt } from 'drizzle-orm'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { Argon2id } from 'oslo/password'
import { decodeHex, encodeHex } from 'oslo/encoding'
import { TOTPController } from 'oslo/otp'
import { z } from 'zod'
import { TimeSpan } from 'lucia'
import { db } from '../../lib/db.js'
import { _recoveryCodes, _twoFactorTokens, ${authModelName}, ${magicLink && '_loginTokens'} } from '../../schema.js'
import { rateLimit } from '../../middleware/rateLimit.js'
import { doLogin } from '../../middleware/authenticate.js'
import { verifyPassword } from '../../lib/password.js'
import { alphabet, generateRandomString, sha256 } from 'oslo/crypto'
import { createDate } from 'oslo'
import { send2faToken, sendLoginToken } from 'lib/email.js'

${
	magicLink &&
	`const createLoginToken = async (userId: string): Promise<string> => {
	await db.delete(_loginTokens).where(eq(_loginTokens.userId, userId))

	await db
		.select()
		.from(_twoFactorTokens)
		.where(eq(_twoFactorTokens.userId, userId))

	const code = generateRandomString(6, alphabet('0-9'))

	await db.insert(_loginTokens).values({
		code,
		userId,
		expiresAt: createDate(new TimeSpan(5, 'm')),
	})

	return code
}`
}

const create2faLoginToken = async (userId: string): Promise<string> => {
	await db
		.select()
		.from(_twoFactorTokens)
		.where(eq(_twoFactorTokens.userId, userId))

	const token = generateRandomString(6, alphabet('0-9'))

	const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)))

	await db.insert(_twoFactorTokens).values({
		tokenHash,
		userId: userId,
		expiresAt: createDate(new TimeSpan(5, 'm')),
	})

	return token
}

export const loginDTO = z.object({
	email: z.string(),
	password: z.string()${magicLink && `.optional()`},
	otp: z.string().optional(),
	${magicLink && `loginToken: z.string().optional(),`}
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
		
		${
			magicLink &&
			`if (user?.password === null && !body.loginToken) {
			// generate a login token
			const code = await createLoginToken(user.id)

			await sendLoginToken(user.email, code)

			return c.json({ loginToken: true })
		} else if (user && body.loginToken) {
			const token = await db.query._loginTokens.findFirst({
				where: and(
					eq(_loginTokens.userId, user.id),
					eq(_loginTokens.code, body.loginToken),
					gt(_loginTokens.expiresAt, new Date())
				),
			})

			if (token) {
				await db
					.delete(_loginTokens)
					.where(eq(_loginTokens.userId, user.id))

				return doLogin(c, user)
			}
		}`
		}

		const email2faEnabled = ${project.settings.auth.enableEmail2fa ? 'true' : 'false'}
		const otpEnabled = user?.twoFactorSecret && user?.twoFactorEnabled

		// check if the password is correct
		const passwordIsCorrect = await verifyPassword(
			body.password || 'never',
			user?.password ?? undefined
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
						.delete(_twoFactorTokens)
						.where(
							and(
								eq(_twoFactorTokens.userId, user.id),
								eq(_twoFactorTokens.tokenHash, tokenHash),
								gt(_twoFactorTokens.expiresAt, new Date())
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
		const codes = await db.query._recoveryCodes.findMany({
			where: eq(_recoveryCodes.userId, user?.id || 'no-id'),
		})

		for (let i = 0; i < codes.length; i++) {
			const code = codes[i]

			if (!code) continue

			const codeIsValid = await new Argon2id().verify(
				code.codeHash,
				body.password || 'never'
			)

			if (codeIsValid) {
				await db
					.delete(_recoveryCodes)
					.where(eq(_recoveryCodes.codeHash, code.codeHash))

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
