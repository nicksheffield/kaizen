const tmpl = () => {
	return `import { db } from 'server/src/lib/db'
	import * as tables from 'server/src/schema'
	import { eq } from 'drizzle-orm'
	import { Argon2id } from 'oslo/password'
	import { generateRandomString, alphabet } from 'oslo/crypto'
	
	const generateId = (length = 15) => {
		return generateRandomString(length, alphabet('a-z', '0-9'))
	}
	
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
				emailVerified: true,
			})
		}
	}	
`
}

export default tmpl
