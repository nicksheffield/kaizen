const tmpl = () => {
	return `import { and, eq } from 'drizzle-orm'
	import { QueryModifiers, CreateModifiers, DeleteModifiers, UpdateModifiers } from 'server/src/lib/modifiers'
	import { users } from 'server/src/schema'
	
	export const queryModifiers: QueryModifiers = {
		// modify the "users" graphql query
		// users: (query, { where, user }) => {
		// 	// if the user is an admin, then don't modify the query
		// 	if (user.roles.includes('admin')) return query
	
		// 	// otherwise, limit the selected users to just THIS user
		// 	return query.where(and(where, eq(users.id, user.id)))
		// }
	}
	
	export const createModifiers: CreateModifiers = {}
	
	export const updateModifiers: UpdateModifiers = {}
	
	export const deleteModifiers: DeleteModifiers = {}
	`
}

export default tmpl
