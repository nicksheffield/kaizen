import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	return `import { Lucia, TimeSpan } from 'lucia'
	import { adapter } from './db.js'
	import { isDev } from '@/lib/env.js'
	
	export const sessionExpiresIn = new TimeSpan(${project.settings.auth?.sessionExpiry ?? 60}, 'm')
	
	export const lucia = new Lucia(adapter, {
		sessionExpiresIn,
		${
			project.settings.auth?.enableCookies
				? `
		sessionCookie: {
			attributes: {
				// set to \`true\` when using HTTPS
				secure: !isDev,
			},
		},
		`
				: ''
		}
		
		getUserAttributes: (attributes) => {
			return {
				id: attributes.id,
				email: attributes.email,
				emailVerified: attributes.emailVerified,
				setupTwoFactor:
					attributes.twoFactorSecret !== null &&
					attributes.twoFactorEnabled, // what is it even used for??
			}
		},
	})
	
	declare module 'lucia' {
		interface Register {
			Lucia: typeof lucia
			DatabaseUserAttributes: {
				id: string
				email: string
				emailVerified: boolean
				twoFactorSecret: string | null
				twoFactorEnabled: boolean
			}
		}
	}
	`
}

export default tmpl
