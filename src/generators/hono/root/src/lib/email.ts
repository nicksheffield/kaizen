import { HonoGeneratorExtras, ProjectCtx } from '@/generators/hono/types'
import { MODS_DIRNAME } from '@/lib/constants'

const tmpl = ({ project, extras }: { project: ProjectCtx; extras: HonoGeneratorExtras }) => {
	const useConfirmation = project.settings.auth.requireAccountConfirmation
	const hasConfirmAccount = extras.emails.find((x) => x === 'ConfirmAccount.tsx')
	const hasResetPassword = extras.emails.find((x) => x === 'ResetPassword.tsx')
	const hasTwoFactorCode = extras.emails.find((x) => x === 'TwoFactorCode.tsx')

	return `import { db } from './db.js'
	import { env } from './env.js'
	import { emailLogs } from '../schema.js'
	import { render } from '@react-email/render'
	import { generateId } from 'lucia'
	import nodemailer from 'nodemailer'
	import { Resend } from 'resend'
	import { eq } from 'drizzle-orm'
	${useConfirmation && hasConfirmAccount ? `import ConfirmAccount from '${MODS_DIRNAME}/emails/ConfirmAccount.js'` : ''}
	${hasResetPassword ? `import ResetPassword from '${MODS_DIRNAME}/emails/ResetPassword.js'` : ''}
	${hasTwoFactorCode ? `import TwoFactorCode from '${MODS_DIRNAME}/emails/TwoFactorCode.js'` : ''}
	
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
	
	export const send = async (options: {
		address: string
		subject: string
		body?: string
		react?: React.JSX.Element
		log?: boolean
	}) => {
		const { address, subject, body, react, log = true } = options
	
		if (!body && !react) throw new Error('No body or react component provided')
	
		const html = react ? render(react) : body!
	
		try {
			if (resendEnabled && resend && env.EMAIL_FROM) {
				const res = await resend.emails.send({
					from: env.EMAIL_FROM,
					to: env.DEV_EMAIL_TO || address,
					subject,
					html,
				})
	
				if (res.error) {
					console.log('resend email error', res.error)
					return false
				}
	
				if (res.data?.id && log) await logEmailResend(res.data.id)
	
				return true
			} else if (emailEnabled && env.EMAIL_FROM) {
				await transport.sendMail({
					from: env.EMAIL_FROM,
					to: env.DEV_EMAIL_TO || address,
					subject,
					html,
				})
	
				if (log) {
					await logEmail({
						provider: 'smtp',
						from: env.EMAIL_FROM,
						to: env.DEV_EMAIL_TO || address,
						subject,
						body: html,
					})
				}
	
				return true
			}
		} catch (error) {
			console.log(error)
		}
		return false
	}
	
	export const logEmailResend = async (id: string) => {
		const res = await resend?.emails.get(id)
	
		if (!res || !res.data) {
			return
		}
	
		await logEmail({
			emailId: id,
			provider: 'resend',
			to: res.data.to.join(', '),
			from: res.data.from,
			subject: res.data.subject,
			body: res.data?.html || res.data?.text || '',
		})
	}
	
	export const logEmail = async (data: {
		emailId?: string
		provider?: string
		from: string
		to: string
		subject: string
		body: string
	}) => {
		await db.insert(emailLogs).values({
			id: generateId(15),
			...data,
			provider: data.provider || 'smtp',
		})
	}
	
	export const resendEmailLog = async (id: string) => {
		const log = await db.query.emailLogs.findFirst({
			where: eq(emailLogs.id, id),
		})
	
		if (!log || !log.to || !log.subject || !log.body) return
	
		await send({ address: log.to, subject: log.subject, body: log.body })
	}
	
	export const sendVerificationEmail = async (
		email: string,
		userId: string,
		code: string
	) => {
		await send({
			address: email,
			subject: 'Verify your email',
			${
				hasConfirmAccount
					? `react: ConfirmAccount.default({
					confirmAccountUrl: \`\${env.EMAIL_BASEURL}/confirm-account\` || 'http://localhost:3001/confirm-account',
					userId,
					validationCode: code,
				})
			`
					: `body: \`Your verification code is: \${code}. Enter it <a href="\${env.EMAIL_BASEURL || http://localhost:3001}/confirm-account?userId=\${userId}">here</a>.\``
			}
		})
	}
	
	export const sendPasswordResetToken = async (email: string, code: string) => {
		await send({
			address: email,
			subject: 'Reset your password',
			${
				hasResetPassword
					? `react: ResetPassword.default({
					resetPasswordUrl: \`\${env.EMAIL_BASEURL}/reset-password\` || 'http://localhost:3001/reset-password',
					resetCode: code,
				})
			`
					: `body: \`Enter your new password <a href="\${env.EMAIL_BASEURL || http://localhost:3001}/reset-password?code=\${code}">here</a>.\``
			}
		})
	}

	export const send2faToken = async (email: string, code: string) => {
		await send({
			address: email,
			subject: 'Login two factor code',
			${hasTwoFactorCode ? `react: TwoFactorCode.default({ code }),` : `html: \`Your two factor authentication code is: \${code}\``}
		})
	}
	`
}

export default tmpl
