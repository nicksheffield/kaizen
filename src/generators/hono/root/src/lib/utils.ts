const tmpl = () => {
	return `import { GraphQLSchema, introspectionFromSchema, printSchema } from 'graphql'
	import { writeFile } from 'node:fs/promises'
	import { join } from 'node:path'
	import mime from 'mime-types'
	import { Context, Next } from 'hono'
	import chalk from 'chalk'

	export const removeDuplicates = <T>(list: T[]): T[] => {
		return list.filter((x, i, a) => a.indexOf(x) === i)
	}

	export const isNotFalse = <T>(x: T | false): x is T => x !== false

	export const writeIntrospection = async (
		schema: GraphQLSchema,
		path: string
	) => {
		await writeFile(join(path, 'schema.graphql'), printSchema(schema), 'utf-8')
		await writeFile(
			join(path, 'schema.json'),
			JSON.stringify(introspectionFromSchema(schema), null, 4),
			'utf-8'
		)
	}

	export const fileExtensions = Object.values(mime.extensions).flat()

	const getPath = (request: Request) => {
		const url = request.url
		const queryIndex = url.indexOf('?', 8)
		return url.slice(
			url.indexOf('/', 8),
			queryIndex === -1 ? void 0 : queryIndex
		)
	}

	export const logger = async (c: Context, next: Next) => {
		const method = c.req.method.padEnd(7, ' ')
		const path = getPath(c.req.raw)

		const queries = Object.entries(c.req.queries())
			.map(([key, [val]]) => {
				if (val && val.length > 0) {
					return \`\${key}=\${val}\`
				}
				return key
			})
			.join('&')

		const url = \`\${path}\${queries ? \`?\${queries}\` : ''}\`

		const date = new Date().toISOString()

		const message = [chalk.blue(method), chalk.yellow(date), url].join('  ')

		if (method !== 'OPTIONS') {
			console.log(message)
		}

		await next()
	}
`
}

export default tmpl
