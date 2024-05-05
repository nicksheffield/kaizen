const tmpl = () => `import { DrizzleMySQLAdapter } from '@lucia-auth/adapter-drizzle'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../schema.js'
import { env } from './env.js'

const connection = mysql.createPool({ uri: env.DB_URI })

export const db = drizzle(connection, {
	mode: 'default',
	schema,
	logger: false,
})

export const adapter = new DrizzleMySQLAdapter(
	db,
	schema.sessions,
	schema.users
)
`

export default tmpl
