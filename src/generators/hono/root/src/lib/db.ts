import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)

	return `import { DrizzleMySQLAdapter } from '@lucia-auth/adapter-drizzle'
	import { drizzle } from 'drizzle-orm/mysql2'
	import mysql from 'mysql2/promise'
	import * as schema from '../schema.js'
	import { env } from './env.js'
	
	export const connection = mysql.createPool({ uri: env.DB_URI })
	
	export const db = drizzle(connection, {
		mode: 'default',
		schema,
		logger: false,
	})
	
	export const adapter = new DrizzleMySQLAdapter(
		db,
		schema._sessions,
		schema.${authModel?.drizzleName || 'users'}
	)
	`
}

export default tmpl
