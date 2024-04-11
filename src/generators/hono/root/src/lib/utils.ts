const tmpl = () => `import { GraphQLSchema, introspectionFromSchema } from 'graphql'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const removeDuplicates = <T>(list: T[]): T[] => {
	return list.filter((x, i, a) => a.indexOf(x) === i)
}

export const isNotFalse = <T>(x: T | false): x is T => x !== false

export const writeIntrospection = async (schema: GraphQLSchema, path: string) => {
	const intro = introspectionFromSchema(schema)

	const str = \`/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by \\\`gql.tada\\\` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your \\\`scalars\\\`, update \\\`tadaOutputLocation\\\` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = \${JSON.stringify(intro, null, 2)};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}\`

	await writeFile(join(path, 'graphql-env.d.ts'), str, 'utf-8')
}
`

export default tmpl
