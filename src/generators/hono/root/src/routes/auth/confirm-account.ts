const tmpl = () => `import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db.js'
import { emailVerificationCodes, users } from '@/schema.js'
import { lucia } from '@/lib/lucia.js'
import { setSessionCookies } from '@/middleware/authenticate.js'
import { generateEmailVerificationCode } from '@/lib/manageUser.js'
import { sendVerificationEmail } from '@/lib/email.js'
import { HTTPException } from 'hono/http-exception'

export const router = new Hono()

const verificationCodeSchema = z.object({
	code: z.string(),
	userId: z.string(),
})

router.post(
	'/confirm-account',
	zValidator('json', verificationCodeSchema),
	async (c) => {
		const body: z.infer<typeof verificationCodeSchema> = await c.req.json()

		const emailVerification =
			await db.query.emailVerificationCodes.findFirst({
				where: and(
					eq(emailVerificationCodes.code, body.code),
					eq(emailVerificationCodes.userId, body.userId)
				),
			})

		if (!emailVerification) {
			return c.json({ error: 'Invalid verification code' }, 400)
		}

		await db
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.userId, body.userId))

		await db
			.update(users)
			.set({
				emailVerified: true,
			})
			.where(eq(users.id, body.userId))

		const session = await lucia.createSession(body.userId, {})
		const newCookie = lucia.createSessionCookie(session.id)

		setSessionCookies(c, session)

		return c.json({ message: 'Email verified' })
	}
)


const resendConfirmationSchema = z.object({
	userId: z.string(),
})

router.post(
	'/resend-account-confirmation',
	zValidator('json', resendConfirmationSchema),
	async (c) => {
		const body: z.infer<typeof resendConfirmationSchema> =
			await c.req.json()

		await db
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.userId, body.userId))

		const user = await db.query.users.findFirst({
			where: eq(users.id, body.userId),
		})

		if (!user) {
			throw new HTTPException(404, { message: 'User not found' })
		}

		if (user.emailVerified) {
			return c.json({ message: 'Account already confirmed' })
		}

		const verificationCode = await generateEmailVerificationCode(
			body.userId,
			user.email
		)

		sendVerificationEmail(user.email, body.userId, verificationCode)

		return c.json({ message: 'Account confirmation email sent' })
	}
)

`

export default tmpl
