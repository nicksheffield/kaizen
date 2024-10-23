import { ModelCtx } from '../../../../../contexts'

const tmpl = ({ models }: { models: ModelCtx[] }) => {
	return `import {
	Table,
	SQLWrapper,
	and,
	Column,
	eq,
	not,
	like,
	inArray,
	isNull,
	or,
	gt,
	gte,
	lt,
	lte,
	sql,
	getTableName,
	getTableColumns
} from 'drizzle-orm'
import { Infer } from 'garph'
import { db } from '../../../lib/db.js'
import * as tables from '../../../schema.js'
import { MySqlTable } from 'drizzle-orm/mysql-core'

type RelationFilter = {
	pk: Column
	fk: Column
	table: MySqlTable
}

const relationFilters: Record<string, Record<string, RelationFilter>> = {
	${models
		.flatMap((model) => {
			return `${model.tableName}: {
				${model.relatedModels
					.map((rel) => {
						return `${rel.fieldName}: {
				pk: tables.${model.drizzleName}.${rel.thisKey},
				fk: tables.${rel.drizzleName}.${rel.oppositeKey},
				table: tables.${rel.drizzleName},
			},`
					})
					.join('')}
			},`
		})
		.join('')}
}

type FilterOperator = (col: Column, value: any) => SQLWrapper

export const filterOperators: Record<string, FilterOperator> = {
	eq: (col, val) => eq(col, val),
	neq: (col, val) => not(eq(col, val)),
	includes: (col, val) => like(col, \`%\${val}%\`),
	nincludes: (col, val) => not(like(col, \`%\${val}%\`)),
	in: (col, val) => inArray(col, val),
	nin: (col, val) => not(inArray(col, val)),
	startsWith: (col, val) => like(col, \`\${val}%\`),
	nstartsWith: (col, val) => not(like(col, \`\${val}%\`)),
	endsWith: (col, val) => like(col, \`%\${val}\`),
	nendsWith: (col, val) => not(like(col, \`%\${val}\`)),
	gt: (col, val) => gt(col, val),
	gte: (col, val) => gte(col, val),
	lt: (col, val) => lt(col, val),
	lte: (col, val) => lte(col, val),
	isSameSecond: (col, val) => sql\`SECOND(\${col}) = SECOND(\${new Date(val)})\`,
	isSameMinute: (col, val) => sql\`MINUTE(\${col}) = MINUTE(\${new Date(val)})\`,
	isSameHour: (col, val) => sql\`HOUR(\${col}) = HOUR(\${new Date(val)})\`,
	isSameDay: (col, val) => sql\`DATE(\${col}) = DATE(\${new Date(val)})\`,
	isSameMonth: (col, val) => sql\`MONTH(\${col}) = MONTH(\${new Date(val)})\`,
	isSameYear: (col, val) => sql\`YEAR(\${col}) = YEAR(\${new Date(val)})\`,
	isBefore: (col, val) => lt(col, new Date(val)),
	isBeforeInclusive: (col, val) => lte(col, new Date(val)),
	isAfter: (col, val) => gt(col, new Date(val)),
	isAfterInclusive: (col, val) => gte(col, new Date(val)),
	isBetween: (col, { from, to }) =>
		and(gt(col, new Date(from)), lt(col, new Date(to)))!,
	isBetweenInclusive: (col, { from, to }) =>
		and(gte(col, new Date(from)), lte(col, new Date(to)))!,
	isNull: (col, _) => isNull(col),
	isNotNull: (col, _) => not(isNull(col)),
} as const

export type FilterHandler<T> = (
	table: Table,
	field: string,
	filter: Infer<T>
) => SQLWrapper[]

export const toWhere = (
	table: Table,
	search: Record<string, any> | null | undefined
) => {
	let queries: (SQLWrapper | undefined)[] = []

	const searchFields = search || {}
	const entries = Object.entries(searchFields)

	for (const [field, filters] of entries) {
		if (field === 'and') {
			let ands: (SQLWrapper | undefined)[] = []

			for (const filterItem of filters) {
				ands = [
					...ands,
					...toWhere(table, filterItem as Record<string, any>),
				]
			}

			queries = [...queries, and(...ands)]

			continue
		}

		if (field === 'or') {
			let ors: (SQLWrapper | undefined)[] = []

			for (const filterItem of filters) {
				ors = [
					...ors,
					...toWhere(table, filterItem as Record<string, any>),
				]
			}

			queries = [...queries, or(...ors)]

			continue
		}

		if (field === 'not') {
			queries = [...queries, not(toWhere(table, filterItem as Record<string, any>))]

			continue
		}

		const col = table[field as keyof typeof table] as Column | undefined

		if (col) {
			const filterEntry = Object.entries(filters)
			for (const [filterName, value] of filterEntry) {
				if (filterOperators[filterName] !== undefined) {
					const query = filterOperators[filterName]?.(col, value)
					queries = [...queries, query]
				}
			}
		} else {
			const filter = searchFields[field]
			const rf = relationFilters[getTableName(table)]?.[field]

			if (!rf) continue

			queries = [
				...queries,
				inArray(
					rf.pk,
					db
						// @ts-expect-error - we dont know which table it is (but they all have id)
						.select({ id: rf.fk })
						.from(rf.table)
						.where(
							and(
								...toWhere(rf.table, filter),
								getTableColumns(rf.table).deletedAt
									? // @ts-expect-error - we are checking if deletedAt is available first
										isNull(rf.table.deletedAt)
									: undefined
							)
						)
				),
			]
		}
	}

	return queries
}
`
}

export default tmpl
