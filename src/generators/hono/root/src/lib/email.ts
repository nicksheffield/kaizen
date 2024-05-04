const tmpl = () => `import { db } from '@/lib/db.js'
import { env } from '@/lib/env.js'
import { emailLogs } from '@/schema.js'
import { generateId } from 'lucia'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const resendEnabled = env.RESEND_API_KEY && env.EMAIL_FROM

const resend = resendEnabled ? new Resend(env.RESEND_API_KEY) : null

const emailEnabled =
	env.EMAIL_HOST &&
	env.EMAIL_PORT &&
	env.EMAIL_USER &&
	env.EMAIL_PASS &&
	env.EMAIL_FROM

const transport = nodemailer.createTransport({
	host: env.EMAIL_HOST,
	port: +(env.EMAIL_PORT || 0),
	auth: {
		user: env.EMAIL_USER,
		pass: env.EMAIL_PASS,
	},
})

export const send = async (address: string, subject: string, body: string) => {
	try {
		if (resendEnabled && resend && env.EMAIL_FROM) {
			const res = await resend.emails.send({
				from: env.EMAIL_FROM,
				to: env.DEV_EMAIL_TO || address,
				subject,
				html: body,
			})

			if (res.error) {
				console.log('resend email error', res.error)
			}

			if (res.data?.id) await logResendEmail(res.data.id)

			return res
		} else if (emailEnabled && env.EMAIL_FROM) {
			return transport.sendMail({
				from: env.EMAIL_FROM,
				to: env.DEV_EMAIL_TO || address,
				subject,
				html: body,
			})
		}
	} catch (error) {
		console.log(error)
	}
}

export const logResendEmail = async (id: string) => {
	const res = await resend?.emails.get(id)

	if (!res || !res.data) {
		return
	}

	await db.insert(emailLogs).values({
		id: generateId(15),
		resendId: id,
		from: res.data.from,
		to: res.data.to[0],
		subject: res.data.subject,
		body: res.data?.html || res.data?.text || '',
	})
}

export const sendVerificationEmail = async (
	email: string,
	userId: string,
	code: string
) => {
	await send(
		email,
		'Verify your email',
		\`Your verification code is: \${code}. Enter it <a href="http://localhost:5175/confirm-account?userId=\${userId}">here</a>.\`
	)
}

export const sendPasswordResetToken = async (email: string, code: string) => {
	await send(
		email,
		'Reset your password',
		\`Enter your new password <a href="http://localhost:5175/reset-password?code=\${code}">here</a>.\`
	)
}
`

export default tmpl
