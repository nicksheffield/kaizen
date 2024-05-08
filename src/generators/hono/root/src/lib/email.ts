import { HonoGeneratorExtras } from '@/generators/hono/types'
import { MODS_DIRNAME } from '@/lib/constants'

const tmpl = ({ extras }: { extras: HonoGeneratorExtras }) => {
	const hasConfirmAccount = extras.emails['ConfirmAccount.tsx']
	const hasResetPassword = extras.emails['ResetPassword.tsx']

	return `import { db } from './db.js'
	import { env } from './env.js'
	import { emailLogs } from '../schema.js'
	import { render } from '@react-email/render'
	import { generateId } from 'lucia'
	import nodemailer from 'nodemailer'
	import { Resend } from 'resend'
	${hasConfirmAccount ? `import ConfirmAccount from '${MODS_DIRNAME}/emails/ConfirmAccount.js'` : ''}
	${hasResetPassword ? `import ResetPassword from '${MODS_DIRNAME}/emails/ResetPassword.js'` : ''}
	
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
					return false
				}
	
				if (res.data?.id) await logResendEmail(res.data.id)
	
				return true
			} else if (emailEnabled && env.EMAIL_FROM) {
				await transport.sendMail({
					from: env.EMAIL_FROM,
					to: env.DEV_EMAIL_TO || address,
					subject,
					html: body,
				})
				return true
			}
		} catch (error) {
			console.log(error)
		}
		return false
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
			${
				hasConfirmAccount
					? `render(
				// @ts-ignore -- this is because of a weird quirk in the monorepo setup
				ConfirmAccount.default({
					confirmAccountUrl: \`\${env.EMAIL_BASEURL}/confirm-account\` || 'http://localhost:3001/confirm-account',
					userId,
					validationCode: code,
				})
			)`
					: `\`Your verification code is: \${code}. Enter it <a href="http://localhost:3001/confirm-account?userId=\${userId}">here</a>.\``
			}
		)
	}
	
	export const sendPasswordResetToken = async (email: string, code: string) => {
		await send(
			email,
			'Reset your password',
			${
				hasConfirmAccount
					? `render(
				// @ts-ignore -- this is because of a weird quirk in the monorepo setup
				ResetPassword.default({
					resetPasswordUrl: \`\${env.EMAIL_BASEURL}/reset-password\` || 'http://localhost:3001/reset-password',
					resetCode: code,
				})
			)`
					: `\`Enter your new password <a href="http://localhost:3001/reset-password?code=\${code}">here</a>.\``
			}
			
		)
	}
	`
}

export default tmpl
