import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)

	const users = authModel?.drizzleName

	return `import { db } from '../../lib/db.js'
import { and, eq, not } from 'drizzle-orm'
import { _sessions, ${users} } from '../../schema.js'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { lucia } from '../../lib/lucia.js'
import {
	hashPassword,
	validatePassword,
	verifyPassword,
} from '../../lib/password.js'
import { authenticate } from '../../middleware/authenticate.js'
import { HTTPException } from 'hono/http-exception'

// @TODO: If the user has implemented multi-factor authentication, such as via authenticator apps or passkeys, they should be prompted to authenticate using their second factor before entering their new password.
// https://thecopenhagenbook.com/password-reset

export const changePasswordDTO = z.object({
	password: z.string(),
	newPassword: z.string(),
})

export const router = new Hono()

router.post(
	'/change-password',
	authenticate,
	zValidator('json', changePasswordDTO),
	async (c) => {
		const user = c.get('user')
		const session = c.get('session')

		const body: z.infer<typeof changePasswordDTO> = await c.req.json()

		// await validatePassword(body.newPassword)

		const hashedPassword = await hashPassword(body.newPassword)

		// check the user's password
		const dbUser = await db.query.${users}.findFirst({
			where: eq(${users}.id, user.id),
		})

		const valid = await verifyPassword(body.password, dbUser?.password ?? undefined)

		if (!valid) {
			throw new HTTPException(400, {
				message: 'Original password is incorrect',
			})
		}

		// log the user out of everywhere else
		await db
			.delete(_sessions)
			.where(
				and(
					eq(_sessions.userId, user.id),
					not(eq(_sessions.id, session.id))
				)
			)

		await db
			.update(${users})
			.set({ password: hashedPassword })
			.where(eq(${users}.id, user.id))

		c.header('Referrer-Policy', 'no-referrer')

		return c.body(null, 204)
	}
)
`
}

export default tmpl
