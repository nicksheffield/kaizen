import { ModelCtx } from '@/generators/hono/contexts'
import { HonoGeneratorExtras } from '@/generators/hono/types'

const tmpl = ({ models, extras }: { models: ModelCtx[]; extras: HonoGeneratorExtras }) => {
	const hasQueryMods = extras.queries

	return `import { SQL } from 'drizzle-orm'
	import {
		AnyMySqlSelect,
		MySqlDelete,
		MySqlInsert,
		MySqlInsertDynamic,
		MySqlSelect,
		MySqlUpdate,
	} from 'drizzle-orm/mysql-core'
	${hasQueryMods ? `import { interceptors } from 'mods/src/queries.js'` : ''}
	import * as tables from '../schema.js'

	type Ctx = {
		user: { id: string; roles: string; email: string }
	}	

	type QueryKey =
	${models.map((x) => `| '${x.drizzleNameSingular}' | '${x.drizzleName}'`).join('\n\t')}
	
	type CreateKey = keyof Creators
	export type CreatorFns = {
		[K in keyof Creators]: <T extends MySqlInsert>(
			query: T,
			data: Ctx & {
				values: Creators[K]['insert']
			}
		) => 
			| T
			| MySqlInsertDynamic<any>
			| null
			| void
			| Promise<T | MySqlInsertDynamic<any> | null | void>
	}
	export type CreateInterceptors = Partial<CreatorFns>
	type Creators = {
		${models.map((model) => {
			return `
				create${model.name}: {
					insert: typeof tables.${model.drizzleName}.$inferInsert
				}
			`
		})}
	}
	
	type UpdateKey = keyof Updaters
	export type UpdaterFns = {
		[K in keyof Updaters]: <T extends MySqlUpdate>(
			query: T,
			data: Ctx & {
				original?: Partial<Updaters[K]['select']>
				values: Partial<Updaters[K]['insert']>
			}
		) => T | MySqlUpdateDynamic<any> | null | void | Promise<T | MySqlUpdateDynamic<any> | null | void>
	}
	export type UpdateInterceptors = Partial<UpdaterFns>
	type Updaters = {
		${models.map((model) => {
			return `
				update${model.name}: {
					select: typeof tables.${model.drizzleName}.$inferSelect
					insert: typeof tables.${model.drizzleName}.$inferInsert
				}
			`
		})}
	}

	type DeleteKey = ${models.map((model) => `| 'delete${model.name}'`).join('\n\t')}
	
	export type QueryInterceptors = Partial<Record<QueryKey, QueryInterceptor>>
	export type QueryInterceptor = <T extends MySqlSelect>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => AnyMySqlSelect | null
	
	export type DeleteInterceptors = Partial<Record<DeleteKey, DeleteInterceptor>>
	export type DeleteInterceptor = <T extends MySqlDelete | MySqlUpdate>(
		query: T,
		ctx: {
			id: string
			user: { id: string; roles: string; email: string }
		}
	) => T | null | void |  Promise<T | null | void>

	export type Interceptors = QueryInterceptors & CreateInterceptors & UpdateInterceptors & DeleteInterceptors
	
	export const interceptQuery = <T extends MySqlSelect>(
		interceptor: QueryKey,
		query: T,
		ctx: Parameters<QueryInterceptor>[1]
	): AnyMySqlSelect | null => {
		${
			hasQueryMods
				? `const mod = interceptors[interceptor]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}

	export const interceptInsertMutation = <
		T extends MySqlInsert,
		S extends CreateKey,
	>(
		interceptor: S,
		query: T,
		ctx: Parameters<CreatorFns[S]>[1]
	): ReturnType<CreatorFns[S]> => {
		${
			hasQueryMods
				? `const mod: CreateInterceptors[S] = interceptors[interceptor]
		if (mod) return mod(query, ctx) as ReturnType<CreatorFns[S]>`
				: ''
		}
		return query as ReturnType<CreatorFns[S]>
	}

	export const interceptUpdateMutation = <
		T extends MySqlUpdate,
		S extends UpdateKey,
	>(
		interceptor: S,
		query: T,
		ctx: Parameters<UpdaterFns[S]>[1]
	): ReturnType<UpdaterFns[S]> => {
		${
			hasQueryMods
				? `const mod = interceptors[interceptor]
		if (mod) return mod(query, ctx) as ReturnType<UpdaterFns[S]>`
				: ''
		}
		return query as ReturnType<UpdaterFns[S]>
	}
	
	export const interceptDeleteMutation = <T extends MySqlDelete | MySqlUpdate>(
		interceptor: DeleteKey,
		query: T,
		ctx: Parameters<DeleteInterceptor>[1]
	): T | null | void | Promise<T | null | void> => {
		${
			hasQueryMods
				? `const mod = interceptors[interceptor]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	`
}

export default tmpl
