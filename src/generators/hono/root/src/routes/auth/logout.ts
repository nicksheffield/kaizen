import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	return `import { lucia } from '../../lib/lucia.js'
import { Hono } from 'hono'
import { authenticate, getSession } from '../../middleware/authenticate.js'
import { db } from 'lib/db.js'
import { and, eq, not } from 'drizzle-orm'
import { sessions } from 'schema.js'
${project.settings.auth?.enableCookies ? `import { setCookie } from 'hono/cookie'` : ''}

export const router = new Hono()

router.post('/logout', async (c) => {
	const { session } = await getSession(c)
	if (session) {
		await lucia.invalidateSession(session.id)
	}

	${
		project.settings.auth?.enableCookies
			? `setCookie(c, 'auth_exists', 'false', {
		maxAge: 0,
		expires: new Date(0),
	})`
			: ''
	}

	return c.body(null, 204)
})

router.post('/purge-sessions', authenticate, async (c) => {
	const session = c.get('session')
	const user = c.get('user')
	
	// log the user out of everywhere else
	await db
		.delete(sessions)
		.where(
			and(
				eq(sessions.userId, user.id),
				not(eq(sessions.id, session.id))
			)
		)

	return c.body(null, 204)
})
`
}

export default tmpl
