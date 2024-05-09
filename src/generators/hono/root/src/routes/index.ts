const tmpl = ({ endpointFiles }: { endpointFiles: string[] }) => {
	const api = endpointFiles.map((x) => {
		const path = x
		const fullPath = x.replace('.ts', '.js')
		const fileName = x.split('/').pop()
		const name = fileName?.split('.').slice(0, -1).join('.')

		console.log({
			path,
			fullPath,
			fileName,
			name,
		})

		return {
			import: `import ${name} from 'mods/api/${fullPath}'`,
			route: `/${path}`,
			router: `${name}.router`,
		}
	})

	return `import { Hono } from 'hono'
	import { router as login } from './auth/login.js'
	import { router as logout } from './auth/logout.js'
	import { router as profile } from './auth/profile.js'
	import { router as twoFactor } from './auth/two-factor.js'
	import { router as confirmAccount } from './auth/confirm-account.js'
	import { router as resetPassword } from './auth/reset-password.js'
	import { router as graphql } from './graphql/router.js'
	import { router as resend } from './webhooks/resend.js'
	${api.map((x) => x.import).join('\n')}
	
	export const router = new Hono()
	
	router.route('/webhooks', resend)
	router.route('/auth', login)
	router.route('/auth', logout)
	router.route('/auth', profile)
	router.route('/auth', twoFactor)
	router.route('/auth', confirmAccount)
	router.route('/auth', resetPassword)
	router.route('/graphql', graphql)
	${api.map((x) => `router.route('${x.route}', ${x.router})`).join('\n')}
	`
}

export default tmpl
