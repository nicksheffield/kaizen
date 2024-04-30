const tmpl = () => `import {
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
} from 'drizzle-orm'
import { Infer, g } from 'garph'

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
	isNull: (col, _) => isNull(col),
	isNotNull: (col, _) => not(isNull(col)),
} as const

export const String = g.inputType('StringFilter', {
	eq: g.string().optional(),
	neq: g.string().optional(),
	includes: g.string().optional(),
	nincludes: g.string().optional(),
	in: g.string().list().optional(),
	nin: g.string().list().optional(),
	startsWith: g.string().optional(),
	nstartsWith: g.string().optional(),
	endsWith: g.string().optional(),
	nendsWith: g.string().optional(),
	isNull: g.boolean().optional(),
	isNotNull: g.boolean().optional(),
})

export const Boolean = g.inputType('BooleanFilter', {
	eq: g.boolean().optional(),
	neq: g.boolean().optional(),
	isNull: g.boolean().optional(),
	isNotNull: g.boolean().optional(),
})

export const Number = g.inputType('NumberFilter', {
	eq: g.float().optional(),
	neq: g.float().optional(),
	in: g.float().list().optional(),
	nin: g.float().list().optional(),
	gt: g.float().optional(),
	gte: g.float().optional(),
	lt: g.float().optional(),
	lte: g.float().optional(),
	isNull: g.boolean().optional(),
	isNotNull: g.boolean().optional(),
})

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

	const entries = Object.entries(search || {})

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

		const col = table[field as keyof typeof table] as Column

		const filterEntry = Object.entries(filters)
		for (const [filterName, value] of filterEntry) {
			if (filterOperators[filterName] !== undefined) {
				const query = filterOperators[filterName](col, value)
				queries = [...queries, query]
			}
		}
	}

	return queries
}
`

export default tmpl
