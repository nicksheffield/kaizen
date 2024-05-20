import { ModelCtx } from '@/generators/hono/contexts'
import { HonoGeneratorExtras } from '@/generators/hono/types'
import { uc } from '@/generators/hono/utils'

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

	type QueryKey =
	${models.map((x) => `| '${x.drizzleNameSingular}' | '${x.drizzleName}'`).join('\n\t')}
	type CreateKey = ${models.map((x) => `| 'create${uc(x.drizzleName)}'`).join('\n\t')}
	type UpdateKey = ${models.map((x) => `| 'update${uc(x.drizzleName)}'`).join('\n\t')}
	type DeleteKey = ${models.map((x) => `| 'delete${uc(x.drizzleName)}'`).join('\n\t')}
	
	export type QueryModifiers = Partial<Record<QueryKey, QueryModifier>>
	export type QueryModifier = <T extends MySqlSelect>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => AnyMySqlSelect | null
	
	export type CreateModifiers = Partial<Record<CreateKey, CreateModifier>>
	export type CreateModifier = <T extends MySqlInsert>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
	export type UpdateModifiers = Partial<Record<UpdateKey, UpdateModifier>>
	export type UpdateModifier = <T extends MySqlUpdate>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
	export type DeleteModifiers = Partial<Record<DeleteKey, DeleteModifier>>
	export type DeleteModifier = <T extends MySqlDelete>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
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
	
	export const modifyInsertMutation = <T extends MySqlInsert>(
		modifier: CreateKey,
		query: T,
		ctx: Parameters<CreateModifier>[1]
	): T | null => {
		${
			hasQueryMods
				? `const mod: CreateModifier | undefined = (
			queryMods.createModifiers as Record<CreateKey, CreateModifier>
		)[modifier as keyof typeof queryMods.createModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	
	export const modifyUpdateMutation = <T extends MySqlUpdate>(
		modifier: UpdateKey,
		query: T,
		ctx: Parameters<UpdateModifier>[1]
	): T | null => {
		${
			hasQueryMods
				? `const mod: UpdateModifier | undefined = (
			queryMods.updateModifiers as Record<UpdateKey, UpdateModifier>
		)[modifier as keyof typeof queryMods.updateModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	
	export const modifyDeleteMutation = <T extends MySqlDelete>(
		modifier: DeleteKey,
		query: T,
		ctx: Parameters<DeleteModifier>[1]
	): T | null => {
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
