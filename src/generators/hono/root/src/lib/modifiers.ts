import { ModelCtx } from '@/generators/hono/contexts'
import { HonoGeneratorExtras } from '@/generators/hono/types'

const tmpl = ({ models, extras }: { models: ModelCtx[]; extras: HonoGeneratorExtras }) => {
	const hasQueryMods = extras.queries

	return `import { SQL } from 'drizzle-orm'
	import {
		AnyMySqlSelect,
		MySqlDelete,
		MySqlInsert,
		MySqlSelect,
		MySqlUpdate,
	} from 'drizzle-orm/mysql-core'
	${hasQueryMods ? `import queryMods from 'mods/src/queries.js'` : ''}
	import * as tables from '../schema.js'

	type Ctx = {
		user: { id: string; roles: string; email: string }
	}	

	type QueryKey =
	${models.map((x) => `| '${x.drizzleNameSingular}' | '${x.drizzleName}'`).join('\n\t')}
	
	type CreateKey = keyof Creaters
	export type CreaterFns = {
		[K in keyof Creaters]: <T extends MySqlInsert>(
			query: T,
			data: Ctx & {
				values: Partial<Creaters[K]['insert']>
			}
		) => T | null | void | Promise<T | null | void>
	}
	export type CreateModifiers = Partial<CreaterFns>
	type Creaters = {
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
		) => T | null | void | Promise<T | null | void>
	}
	export type UpdateModifiers = Partial<UpdaterFns>
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
	
	export type QueryModifiers = Partial<Record<QueryKey, QueryModifier>>
	export type QueryModifier = <T extends MySqlSelect>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => AnyMySqlSelect | null
	
	export type DeleteModifiers = Partial<Record<DeleteKey, DeleteModifier>>
	export type DeleteModifier = <T extends MySqlDelete | MySqlUpdate>(
		query: T,
		ctx: {
			id: string
			user: { id: string; roles: string; email: string }
		}
	) => T | null | void |  Promise<T | null | void>
	
	export const modifyQuery = <T extends MySqlSelect>(
		modifier: QueryKey,
		query: T,
		ctx: Parameters<QueryModifier>[1]
	): AnyMySqlSelect | null => {
		${
			hasQueryMods
				? `const mod: QueryModifier | undefined = (
			queryMods.queryModifiers as Record<QueryKey, QueryModifier>
		)[modifier as keyof typeof queryMods.queryModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}

	export const modifyInsertMutation = <
		T extends MySqlInsert,
		S extends CreateKey,
	>(
		modifier: S,
		query: T,
		ctx: Parameters<CreaterFns[S]>[1]
	): ReturnType<CreaterFns[S]> => {
		${
			hasQueryMods
				? `const mod = queryMods.createModifiers[modifier]
		if (mod) return mod(query, ctx) as ReturnType<CreaterFns[S]>`
				: ''
		}
		return query as ReturnType<CreaterFns[S]>
	}

	export const modifyUpdateMutation = <
		T extends MySqlUpdate,
		S extends UpdateKey,
	>(
		modifier: S,
		query: T,
		ctx: Parameters<UpdaterFns[S]>[1]
	): ReturnType<UpdaterFns[S]> => {
		${
			hasQueryMods
				? `const mod = queryMods.updateModifiers[modifier]
		if (mod) return mod(query, ctx) as ReturnType<UpdaterFns[S]>`
				: ''
		}
		return query as ReturnType<UpdaterFns[S]>
	}
	
	export const modifyDeleteMutation = <T extends MySqlDelete | MySqlUpdate>(
		modifier: DeleteKey,
		query: T,
		ctx: Parameters<DeleteModifier>[1]
	): T | null | void | Promise<T | null | void> => {
		${
			hasQueryMods
				? `const mod: DeleteModifier | undefined = (
			queryMods.deleteModifiers as Record<DeleteKey, DeleteModifier>
		)[modifier as keyof typeof queryMods.deleteModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	`
}

export default tmpl
