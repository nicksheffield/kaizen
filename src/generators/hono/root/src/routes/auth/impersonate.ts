const tmpl = () => {
	return `import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../../lib/db.js'
import { authenticate, doLogin } from '../../middleware/authenticate.js'
import { and, eq } from 'drizzle-orm'
import { users } from 'schema.js'
import { HTTPException } from 'hono/http-exception'

export const impersonateDTO = z.object({
	userId: z.string(),
})

export const router = new Hono()

router.post(
	'/impersonate',
	authenticate,
	zValidator('json', impersonateDTO),
	async (c) => {
		const body: z.infer<typeof impersonateDTO> = await c.req.json()

		const user = c.get('user')

		const dbUser = await db.query.users.findFirst({
			where: and(eq(users.id, user.id)),
		})

		if (!dbUser?.roles.split('|').includes('impersonator')) {
			throw new HTTPException(403, { message: 'Forbidden' })
		}

		const targetUser = await db.query.users.findFirst({
			where: and(eq(users.id, body.userId)),
		})

		if (!targetUser) {
			throw new HTTPException(404, { message: 'User not found' })
		}

		return doLogin(c, user)
	}
)
`
}

export default tmpl