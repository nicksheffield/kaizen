import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const userModel = project.models.find((x) => project.settings.userModelId === x.id)
	const nonSelectAttrs = userModel?.attributes.filter((x) => !x.selectable) || []

	return `import { db } from '@/lib/db.js'
	import { users } from '@/schema.js'
	import { eq } from 'drizzle-orm'
	import { Hono } from 'hono'
	import { authenticate } from '@/middleware/authenticate.js'
	
	export const router = new Hono()
	
	router.get('/profile', authenticate, async (c) => {
		const user = c.get('user')
	
		const dbUser = await db.query.users.findFirst({
			${
				nonSelectAttrs.length > 0
					? `columns: {
				${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
				},`
					: ''
			}
			where: eq(users.id, user.id),
		})
	
		return c.json(dbUser)
	})
	`
}

export default tmpl
