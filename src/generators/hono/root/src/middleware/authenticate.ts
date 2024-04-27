import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const cookies = project.auth?.cookies
	const bearer = project.auth?.bearer

	return `import { lucia } from '@/lib/lucia.js'
	import { Context, MiddlewareHandler } from 'hono'
	${cookies ? `import { getCookie, setCookie } from 'hono/cookie'` : ''}
	import { HTTPException } from 'hono/http-exception'
	import { Session, User } from 'lucia'
	
	export const getSession = async (c: Context) => {
		${
			cookies
				? `const cookie = getCookie(c)
	
		if (cookie) {
			const sessionCookie = cookie.auth_session
			if (sessionCookie) {
				const res = await lucia.validateSession(sessionCookie)
				return res
			}
		}`
				: ''
		}
		
	
		${
			bearer
				? `const authorization = c.req.header('authorization')
	
		if (authorization) {
			const token = lucia.readBearerToken(authorization)
			if (token) {
				const res = await lucia.validateSession(token)
				return res
			}
		}`
				: ''
		}
	
		return { user: null, session: null }
	}
	
	export const authenticate: MiddlewareHandler<{
		Variables: {
			user: User
			session: Session
		}
	}> = async (c, next) => {
		const { user, session } = await getSession(c)
	
		// if no session, return 401
		if (!user || !session) {
			throw new HTTPException(401, { message: 'Unauthorized' })
		}
	
		${
			cookies
				? `// handle refreshing session
		if (session.fresh) {
			await setSessionCookies(c, session)
		}`
				: ''
		}
	
		c.set('user', user)
		c.set('session', session)
	
		await next()
	}

	// a version of the authenticate middleware that doesn't throw an error
	export const authDecorate: MiddlewareHandler<{
		Variables: {
			user: User | null
			session: Session | null
		}
	}> = async (c, next) => {
		const { user, session } = await getSession(c)

		c.set('user', user)
		c.set('session', session)

		// handle refreshing session
		if (session?.fresh) {
			await setSessionCookies(c, session)
		}

		await next()
	}
	
	export const setSessionCookies = async (c: Context, session: Session) => {
		${
			cookies
				? `const newCookie = lucia.createSessionCookie(session.id)
	
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
				: ''
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
