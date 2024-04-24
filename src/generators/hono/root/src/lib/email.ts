const tmpl = () => `import { env } from '@/lib/env.js'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const resend = new Resend(env.RESEND_API_KEY)

const resendEnabled = env.RESEND_API_KEY && env.EMAIL_FROM

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

export const send = (address: string, subject: string, body: string) => {
	try {
		if (resendEnabled) {
			return resend.emails.send({
				from: env.EMAIL_FROM!, // we know this is fine because of the emailEnabled check
				to: address,
				subject,
				html: body,
			})
		} else if (emailEnabled) {
			return transport.sendMail({
				from: env.EMAIL_FROM,
				to: address,
				subject,
				html: body,
			})
		}
	} catch (error) {
		console.log(error)
	}
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
