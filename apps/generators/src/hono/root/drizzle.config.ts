const tmpl = () => `import type { Config } from 'drizzle-kit'

export default {
	schema: './src/schema.ts',
	driver: 'mysql2',
	dbCredentials: { uri: process.env.DB_URI },
} satisfies Config
`

export default tmpl
