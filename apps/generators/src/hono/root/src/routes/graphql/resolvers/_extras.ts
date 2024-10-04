const tmpl = () => `import { g } from 'garph'

export const OrderDir = g.enumType('OrderDir', ['ASC', 'DESC'] as const)

export const DateType = g.scalarType<Date, string>('Date', {
	serialize: (value) => value.toISOString(),
	parseValue: (value) => new Date(value),
})

export const StringFilter = g.inputType('StringFilter', {
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

export const BooleanFilter = g.inputType('BooleanFilter', {
	eq: g.boolean().optional(),
	neq: g.boolean().optional(),
	isNull: g.boolean().optional(),
	isNotNull: g.boolean().optional(),
})

export const NumberFilter = g.inputType('NumberFilter', {
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

const DateBetweenFilter = g.inputType('DateBetween', {
	from: g.string().optional(),
	to: g.string().optional(),
})

export const DateFilter = g.inputType('DateFilter', {
	isSameSecond: g.string().optional(),
	isSameMinute: g.string().optional(),
	isSameHour: g.string().optional(),
	isSameDay: g.string().optional(),
	isSameMonth: g.string().optional(),
	isSameYear: g.string().optional(),
	isBefore: g.string().optional(),
	isBeforeInclusive: g.string().optional(),
	isAfter: g.string().optional(),
	isAfterInclusive: g.string().optional(),
	isBetween: g.ref(DateBetweenFilter).optional(),
	isBetweenInclusive: g.ref(DateBetweenFilter).optional(),
	isNull: g.boolean().optional(),
	isNotNull: g.boolean().optional(),
})
`

export default tmpl
