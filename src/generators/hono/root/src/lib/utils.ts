import { HonoGeneratorExtras } from '@/generators/hono/types'

const tmpl = ({ extras }: { extras: HonoGeneratorExtras }) => {
	const hasQueryMods = extras.queries

	return `import { GraphQLSchema, introspectionFromSchema, printSchema } from 'graphql'
	import { writeFile } from 'node:fs/promises'
	import { join } from 'node:path'
	import mime from 'mime-types'
	import queryMods from 'mods/src/queries.js'
	import { MySqlSelect } from 'drizzle-orm/mysql-core'
	${hasQueryMods ? `import { QueryModifier } from 'schema.js'` : ''}
	
	export const removeDuplicates = <T>(list: T[]): T[] => {
		return list.filter((x, i, a) => a.indexOf(x) === i)
	}
	
	export const isNotFalse = <T>(x: T | false): x is T => x !== false
	
	export const writeIntrospection = async (schema: GraphQLSchema, path: string) => {
		await writeFile(join(path, 'schema.graphql'), printSchema(schema), 'utf-8')
		await writeFile(join(path, 'schema.json'), JSON.stringify(introspectionFromSchema(schema), null, 4), 'utf-8')
	}
	
	export const fileExtensions = Object.values(mime.extensions).flat()
	
	export const modifyQuery = (
		modifier: string,
		query: MySqlSelect,
		ctx: Parameters<QueryModifier>[1]
	) => {
		${
			hasQueryMods
				? `const mod: QueryModifier | undefined =
			queryMods[modifier as keyof typeof queryMods]
	
		if (mod) return mod(query, ctx)`
				: ''
		}
		return query
	}
	`
}

export default tmpl
