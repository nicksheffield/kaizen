const tmpl = () => `import { g } from 'garph'

export const OrderDir = g.enumType('OrderDir', ['ASC', 'DESC'] as const)

export const DateType = g.scalarType<Date, string>('Date', {
	serialize: (value) => value.toISOString(),
	parseValue: (value) => new Date(value),
})
`

export default tmpl
