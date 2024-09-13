const tmpl = () => {
	return `import { and, eq } from 'drizzle-orm'
	import { QueryInterceptors, CreateInterceptors, DeleteInterceptors, UpdateInterceptors } from 'server/src/lib/interceptors'
	import { users } from 'server/src/schema'
	
	export const queryInterceptors: QueryInterceptors = {
		// modify the "users" graphql query
		// users: (query, { where, user }) => {
		// 	// if the user is an admin, then don't modify the query
		// 	if (user.roles.includes('admin')) return query
	
		// 	// otherwise, limit the selected users to just THIS user
		// 	return query.where(and(where, eq(users.id, user.id)))
		// }
	}
	
	export const createInterceptors: CreateInterceptors = {}
	
	export const updateInterceptors: UpdateInterceptors = {}
	
	export const deleteInterceptors: DeleteInterceptors = {}
	`
}

export default tmpl
