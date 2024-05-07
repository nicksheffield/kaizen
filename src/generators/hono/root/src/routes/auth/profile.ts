import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)
	const nonSelectAttrs = authModel?.attributes.filter((x) => !x.selectable) || []

	const authModelName = authModel?.drizzleName || 'users'

	return `import { db } from '../../lib/db.js'
	import { ${authModelName} } from '../../schema.js'
	import { eq } from 'drizzle-orm'
	import { Hono } from 'hono'
	import { authenticate } from '../../middleware/authenticate.js'
	
	export const router = new Hono()
	
	router.get('/profile', authenticate, async (c) => {
		const user = c.get('user')
	
		const dbUser = await db.query.${authModelName}.findFirst({
			${
				nonSelectAttrs.length > 0
					? `columns: {
				${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
				},`
					: ''
			}
			where: eq(${authModelName}.id, user.id),
		})
	
		return c.json(dbUser)
	})
	`
}

export default tmpl
