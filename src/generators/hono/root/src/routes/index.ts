const tmpl = () => {
	return `import { Hono } from 'hono'
	import { router as login } from './auth/login.js'
	import { router as logout } from './auth/logout.js'
	import { router as profile } from './auth/profile.js'
	import { router as twoFactor } from './auth/two-factor.js'
	import { router as confirmAccount } from './auth/confirm-account.js'
	import { router as resetPassword } from './auth/reset-password.js'
	import { router as graphql } from './graphql/router.js'
	import { router as resend } from './webhooks/resend.js'
	
	export const router = new Hono()
	
	router.route('/resend', resend)
	router.route('/auth', login)
	router.route('/auth', logout)
	router.route('/auth', profile)
	router.route('/auth', twoFactor)
	router.route('/auth', confirmAccount)
	router.route('/auth', resetPassword)
	router.route('/graphql', graphql)
	`
}

export default tmpl
