import { HonoGeneratorExtras } from '@/generators/hono/types'

const tmpl = ({ extras }: { extras: HonoGeneratorExtras }) => {
	const hasQueryMods = extras.queries

	return `import { SQL } from 'drizzle-orm'
	import {
		MySqlDelete,
		MySqlInsert,
		MySqlSelect,
		MySqlUpdate,
	} from 'drizzle-orm/mysql-core'
	${hasQueryMods ? `import queryMods from 'mods/src/queries.js'` : ''}
	
	export type QueryModifiers = Record<string, QueryModifier>
	export type QueryModifier = <T extends MySqlSelect>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
	export type CreateModifiers = Record<string, CreateModifier>
	export type CreateModifier = <T extends MySqlInsert>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
	export type UpdateModifiers = Record<string, UpdateModifier>
	export type UpdateModifier = <T extends MySqlUpdate>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
	export type DeleteModifiers = Record<string, DeleteModifier>
	export type DeleteModifier = <T extends MySqlDelete>(
		query: T,
		ctx: {
			where?: SQL<unknown>
			user: { id: string; roles: string; email: string }
		}
	) => T | null
	
	export const modifyQuery = <T extends MySqlSelect>(
		modifier: string,
		query: T,
		ctx: Parameters<QueryModifier>[1]
	): T | null => {
		${
			hasQueryMods
				? `const mod: QueryModifier | undefined = (
			queryMods.queryModifiers as Record<string, QueryModifier>
		)[modifier as keyof typeof queryMods.queryModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	
	export const modifyInsertMutation = <T extends MySqlInsert>(
		modifier: string,
		query: T,
		ctx: Parameters<CreateModifier>[1]
	): T | null => {
		${
			hasQueryMods
				? `const mod: CreateModifier | undefined = (
			queryMods.createModifiers as Record<string, CreateModifier>
		)[modifier as keyof typeof queryMods.createModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	
	export const modifyUpdateMutation = <T extends MySqlUpdate>(
		modifier: string,
		query: T,
		ctx: Parameters<UpdateModifier>[1]
	): T | null => {
		${
			hasQueryMods
				? `const mod: UpdateModifier | undefined = (
			queryMods.updateModifiers as Record<string, UpdateModifier>
		)[modifier as keyof typeof queryMods.updateModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	
	export const modifyDeleteMutation = <T extends MySqlDelete>(
		modifier: string,
		query: T,
		ctx: Parameters<DeleteModifier>[1]
	): T | null => {
		${
			hasQueryMods
				? `const mod: DeleteModifier | undefined = (
			queryMods.deleteModifiers as Record<string, DeleteModifier>
		)[modifier as keyof typeof queryMods.deleteModifiers]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	`
}

export default tmpl
