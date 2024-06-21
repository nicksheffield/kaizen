import { HonoGeneratorExtras, ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project, extras }: { project: ProjectCtx; extras: HonoGeneratorExtras }) => {
	const hasApi = extras.api !== undefined

	return `import { Hono } from 'hono'
	import { router as login } from './auth/login.js'
	import { router as logout } from './auth/logout.js'
	import { router as profile } from './auth/profile.js'
	import { router as twoFactor } from './auth/two-factor.js'
	${project.settings.auth.requireAccountConfirmation ? `import { router as confirmAccount } from './auth/confirm-account.js'` : ''}
	import { router as resetPassword } from './auth/reset-password.js'
	import { router as changePassword } from './auth/change-password.js'
	import { router as graphql } from './graphql/router.js'
	import { router as resend } from './webhooks/resend.js'
	${hasApi ? "import { default as api } from 'mods/src/api.js'" : ''}
	
	export const router = new Hono()
	
	router.route('/webhooks', resend)
	router.route('/auth', login)
	router.route('/auth', logout)
	router.route('/auth', profile)
	router.route('/auth', twoFactor)
	${project.settings.auth.requireAccountConfirmation ? `router.route('/auth', confirmAccount)` : ''}
	router.route('/auth', resetPassword)
	router.route('/auth', changePassword)
	router.route('/graphql', graphql)
	${hasApi ? "router.route('/', api.router)" : ''}
	`
}

export default tmpl
