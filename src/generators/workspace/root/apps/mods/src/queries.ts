const tmpl = () => {
	return `import { and, eq } from 'drizzle-orm'
	import { type QueryModifier, users } from 'server/src/schema'
	
	/**
	 * Example of a query modifier.
	 * This makes sure non-admins cannot see other users when using the "users" query
	 */
	export const usersQuery: QueryModifier = (query, { where, user }) => {
		// if the user is an admin, then don't modify the query
		if (user.roles.includes('admin')) return query
	
		// otherwise, limit the selected users to just THIS user
		return query.where(and(where, eq(users.id, user.id)))
	}`
}

export default tmpl
