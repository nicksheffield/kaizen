const tmpl = () => `import { TimeSpan, createDate } from 'oslo'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'
import { generateId } from 'lucia'
import { db } from '../../lib/db.js'
import { eq } from 'drizzle-orm'
import { passwordResetToken, sessions, users } from '../../schema.js'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { lucia } from '../../lib/lucia.js'
import { Argon2id } from 'oslo/password'
import { sendPasswordResetToken } from '../../lib/email.js'
import { rateLimit } from '../../middleware/rateLimit.js'

// @TODO: If the user has implemented multi-factor authentication, such as via authenticator apps or passkeys, they should be prompted to authenticate using their second factor before entering their new password.
// https://thecopenhagenbook.com/password-reset

export const resetPasswordDTO = z.object({
	password: z.string(),
})

const createPasswordResetToken = async (userId: string): Promise<string> => {
	await db
		.select()
		.from(passwordResetToken)
		.where(eq(passwordResetToken.userId, userId))

	const tokenId = generateId(40)
	const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)))

	await db.insert(passwordResetToken).values({
		tokenHash: tokenHash,
		userId: userId,
		expiresAt: createDate(new TimeSpan(1, 'h')),
	})

	return tokenId
}

const isWithinExpirationDate = (date: Date) => {
	return new Date() < date
}

export const router = new Hono()

router.post(
	'/reset-password',
	zValidator(
		'json',
		z.object({
			email: z.string().email(),
		})
	),
	rateLimit(
		new TimeSpan(1, 'h'),
		10,
		async (c) => (await c.req.json()).email
	),
	async (c) => {
		const { email } = await c.req.json()

		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		})

		if (!user) {
			return c.json({ message: 'Invalid email' }, 400)
		}

		const verificationToken = await createPasswordResetToken(user.id)

		await sendPasswordResetToken(email, verificationToken)

		return c.json({ email: 'sent (not really)' })
	}
)

router.post(
	'/reset-password/:token',
	zValidator('json', resetPasswordDTO),
	async (c) => {
		const verificationToken = c.req.param('token')
		const body: z.infer<typeof resetPasswordDTO> = await c.req.json()

		if (typeof body.password !== 'string' || body.password.length < 8) {
			return c.body(null, 400)
		}

		const tokenHash = encodeHex(
			await sha256(new TextEncoder().encode(verificationToken))
		)
		const tokens = await db
			.select()
			.from(passwordResetToken)
			.where(eq(passwordResetToken.tokenHash, tokenHash))

		const token = tokens[0]

		if (token) {
			await db
				.delete(passwordResetToken)
				.where(eq(passwordResetToken.tokenHash, tokenHash))
		}

		if (!token || !isWithinExpirationDate(token.expiresAt)) {
			return new Response(null, {
				status: 400,
			})
		}

		await lucia.invalidateUserSessions(token.userId)
		const hashedPassword = await new Argon2id().hash(body.password)

		// log the user out of everywhere
		await db.delete(sessions).where(eq(sessions.userId, token.userId))

		await db
			.update(users)
			.set({ password: hashedPassword, emailVerified: true })
			.where(eq(users.id, token.userId))

		c.header('Referrer-Policy', 'no-referrer')

		return c.body(null, 204)
	}
)
`

export default tmpl
