import { clean } from '../../../../utils'
import { ProjectCtx } from '../../../types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const cookies = project.settings.auth?.enableCookies
	const bearer = project.settings.auth?.enableBearer
	const apiKeys = project.settings.auth?.enableApiKeys

	return clean`import { lucia } from '../lib/lucia.js'
	import { Context, MiddlewareHandler } from 'hono'
	${cookies && `import { getCookie, setCookie } from 'hono/cookie'`}
	${apiKeys && `import { App, validateApiKeySession } from 'lib/apiKeys.js'`}
	import { HTTPException } from 'hono/http-exception'
	import { Session, User } from 'lucia'
	
	export const getSession = async (c: Context) => {
		${
			cookies &&
			`const cookie = getCookie(c)
	
		if (cookie) {
			const sessionCookie = cookie.auth_session
			if (sessionCookie) {
				const res = await lucia.validateSession(sessionCookie)
				return {
					user: res.user,
					app: null,
					session: res.session,
				}
			}
		}`
		}
		
		${
			bearer &&
			`const authorization = c.req.header('authorization')
	
		if (authorization) {
			const token = lucia.readBearerToken(authorization)
			if (token) {
				const res = await lucia.validateSession(token)
				return {
					user: res.user,
					app: null,
					session: res.session,
				}
			}
		}`
		}

		${
			apiKeys &&
			`const token = c.req.header('x-api-key')

		if (token) {
			const res = await validateApiKeySession(token)
			return {
				user: null,
				app: res.app,
				session: res.session,
			}
		}`
		}
	
		return { user: null, session: null }
	}
	
	export const authenticate: MiddlewareHandler<{
		Variables: {
			user: User
			app: App
			session: Session
		}
	}> = async (c, next) => {
		const { session, user, app } = await getSession(c)
	
		// if no session, return 401
		if (!session) {
			throw new HTTPException(401, { message: 'Unauthorized' })
		}
	
		${
			cookies &&
			`// handle refreshing session
		if (session.fresh) {
			await setSessionCookies(c, session)
		}`
		}
	
		if (user) c.set('user', user)
		if (app) c.set('app', app)
		c.set('session', session)
	
		await next()
	}

	// a version of the authenticate middleware that doesn't throw an error
	export const authDecorate: MiddlewareHandler<{
		Variables: {
			user: User | null
			app: App | null
			session: Session | null
		}
	}> = async (c, next) => {
		const { user, app, session } = await getSession(c)

		c.set('user', user)
		c.set('app', app || null)
		c.set('session', session)

		// handle refreshing session
		if (session?.fresh) {
			await setSessionCookies(c, session)
		}

		await next()
	}
	
	export const setSessionCookies = async (c: Context, session: Session) => {
		${
			cookies &&
			`const newCookie = lucia.createSessionCookie(session.id)
	
		setCookie(c, 'auth_session', session.id, {
			secure: newCookie.attributes.secure,
			path: newCookie.attributes.path,
			domain: newCookie.attributes.domain,
			sameSite: newCookie.attributes.sameSite?.toLowerCase() as any,
			httpOnly: newCookie.attributes.httpOnly,
			maxAge: newCookie.attributes.maxAge,
			expires: newCookie.attributes.expires,
		})
	
		setCookie(c, 'auth_exists', 'true', {
			secure: false,
			path: newCookie.attributes.path,
			domain: newCookie.attributes.domain,
			sameSite: newCookie.attributes.sameSite?.toLowerCase() as any,
			httpOnly: false,
			maxAge: newCookie.attributes.maxAge,
			expires: newCookie.attributes.expires,
		})`
		}
	
		return session
	}
	
	export const doLogin = async (c: Context, user: { id: string }) => {
		const session = await lucia.createSession(user.id, {})
		await setSessionCookies(c, session)
	
		return c.json({ token: session.id })
	}
	`
}

export default tmpl
