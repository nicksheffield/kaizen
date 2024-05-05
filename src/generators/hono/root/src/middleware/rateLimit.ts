const tmpl = () => `import { getSession } from './authenticate.js'
import { Context, MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { TimeSpan } from 'lucia'

type Container = {
	expiresAt: Date
	requests: Record<string, number>
}

type GetIdentifier = (c: Context) => string | Promise<string>

const getIp = (c: Context) => String(c.env.incoming.socket.remoteAddress)

// https://blog.logrocket.com/rate-limiting-node-js/
export const rateLimit = (
	WINDOW: TimeSpan,
	MAX_REQUESTS: number,
	getIdentifier: GetIdentifier = getIp
): MiddlewareHandler => {
	const container: Container = {
		expiresAt: new Date(0),
		requests: {},
	}

	return async (c, next) => {
		const { user, session } = await getSession(c)

		// if no session, return 401
		if (!user || !session) {
			const identifier = await getIdentifier(c)

			if (container.expiresAt < new Date()) {
				container.requests = { [identifier]: 1 }
				container.expiresAt = new Date(
					new Date().getTime() + WINDOW.milliseconds()
				)
			} else {
				const count = container.requests[identifier] || 0

				if (count >= MAX_REQUESTS) {
					throw new HTTPException(429, {
						message: 'Too many requests',
					})
				}

				container.requests[identifier] = count + 1
			}
		}

		await next()
	}
}
`

export default tmpl
