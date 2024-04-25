const tmpl = () => {
	return `import { db } from '@/lib/db.js'
import { eq, lt } from 'drizzle-orm'
import * as tables from '@/schema.js'
import { generateId } from 'lucia'
import { Argon2id } from 'oslo/password'

export default async () => {
	// create admin user if it doesn't exist
	const adminUser = await db.query.users.findFirst({
		where: eq(tables.users.email, 'admin@example.com'),
	})

	if (!adminUser) {
		await db.insert(tables.users).values({
			id: generateId(15),
			email: 'admin@example.com',
			password: await new Argon2id().hash('password'),
			roles: 'default|admin',
		})
	}
}
`
}

export default tmpl
