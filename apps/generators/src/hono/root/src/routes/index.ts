import { clean } from '../../../../utils'
import { HonoGeneratorExtras, ProjectCtx } from '../../../types'

const tmpl = ({
	project,
	extras,
}: {
	project: ProjectCtx
	extras: HonoGeneratorExtras
}) => {
	const hasApi = extras.api !== undefined

	const {
		requireAccountConfirmation,
		enableImpersonation,
		enableRegistration,
	} = project.settings.auth

	return clean`import { Hono } from 'hono'
	import { router as login } from './auth/login.js'
	import { router as logout } from './auth/logout.js'
	import { router as profile } from './auth/profile.js'
	import { router as twoFactor } from './auth/two-factor.js'
	${requireAccountConfirmation && `import { router as confirmAccount } from './auth/confirm-account.js'`}
	${enableImpersonation && `import { router as impersonate } from './auth/impersonate.js'`}
	${enableRegistration && `import { router as register } from './auth/register.js'`}
	import { router as resetPassword } from './auth/reset-password.js'
	import { router as changePassword } from './auth/change-password.js'
	import { router as graphql } from './graphql/router.js'
	import { router as resend } from './webhooks/resend.js'
	${hasApi && "import { default as api } from 'mods/src/api.js'"}
	
	export const router = new Hono()
	
	router.route('/webhooks', resend)
	router.route('/auth', login)
	router.route('/auth', logout)
	router.route('/auth', profile)
	router.route('/auth', twoFactor)
	${requireAccountConfirmation && `router.route('/auth', confirmAccount)`}
	${enableImpersonation && `router.route('/auth', impersonate)`}
	${enableRegistration && `router.route('/auth', register)`}
	router.route('/auth', resetPassword)
	router.route('/auth', changePassword)
	router.route('/graphql', graphql)
	${hasApi && "router.route('/', api.router)"}
	`
}

export default tmpl
