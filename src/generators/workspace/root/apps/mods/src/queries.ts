const tmpl = () => {
	return `
	import { Interceptors } from 'server/src/lib/interceptors'
	
	export const interceptors: Interceptors = {
		// modify the "users" graphql query
		// users: (query, { where, user }) => {
		// 	// if the user is an admin, then don't modify the query
		// 	if (user.roles.includes('admin')) return query
	
		// 	// otherwise, limit the selected users to just THIS user
		// 	return query.where(and(where, eq(users.id, user.id)))
		// }
	}
	`
}

export default tmpl
