import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project, endpointFiles }: { project: ProjectCtx; endpointFiles: string[] }) => {
	const api = endpointFiles.map((x) => {
		const path = x
		const fullPath = x.replace('.ts', '.js')

		const name = x
			.split('/')
			.filter((x) => !!x)
			.slice(0, -1)
			.join('/')
			.replace(/\/|\./g, '_')
			.replace(/\.[tj]sx?$/, '')

		const route = `/${path
			.split('/')
			.filter((x) => !!x)
			.slice(0, -1)
			.join('/')}`

		return {
			import: `import ${name} from 'mods/api${fullPath}'`,
			route,
			router: `${name}.router`,
		}
	})

	return `import { Hono } from 'hono'
	import { router as login } from './auth/login.js'
	import { router as logout } from './auth/logout.js'
	import { router as profile } from './auth/profile.js'
	import { router as twoFactor } from './auth/two-factor.js'
	${project.settings.auth.requireAccountConfirmation ? `import { router as confirmAccount } from './auth/confirm-account.js'` : ''}
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
	${project.settings.auth.requireAccountConfirmation ? `router.route('/auth', confirmAccount)` : ''}
	router.route('/auth', resetPassword)
	router.route('/graphql', graphql)
	${api.map((x) => `router.route('${x.route}', ${x.router})`).join('\n')}
	`
}

export default tmpl
