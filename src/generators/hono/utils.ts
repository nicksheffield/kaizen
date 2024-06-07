import prettier from 'prettier'
import typescriptPlugin from 'prettier/plugins/typescript'
import estreePlugin from 'prettier/plugins/estree'
import { Attribute, AttributeType, Model } from '@/lib/projectSchemas'
import { plural, singular } from 'pluralize'

export const format = async (content: string, settings: Partial<prettier.Options> = {}) => {
	try {
		const result = await prettier.format(content, {
			tabWidth: 4,
			useTabs: true,
			singleQuote: true,
			semi: false,
			printWidth: 80,
			trailingComma: 'es5',
			arrowParens: 'always',
			parser: 'typescript',
			...settings,
			plugins: [estreePlugin, typescriptPlugin],
		})
		return result
	} catch (e) {
		console.log(e)
		return `/* unformatted */
${content}`
	}
}

export const sortAttrs = (a: Attribute, b: Attribute) => {
	if (a.name === 'id') return -1
	return a.order - b.order
}

export const uc = (str: string) => {
	const firstLetter = str[0]
	if (!firstLetter) throw new Error('No first letter in string')
	return `${firstLetter.toUpperCase()}${str.slice(1)}`
}

export const lc = (str: string) => {
	const firstLetter = str[0]
	if (!firstLetter) throw new Error('No first letter in string')
	return `${firstLetter.toLowerCase()}${str.slice(1)}`
}

export const getSmallName = (model: Model) => singular(model.key || camelize(model.name))

export const getBigName = (model: Model) => uc(getSmallName(model))

export const getTableName = (model: Model) => model.tableName || plural(model.key || camelize(model.name))

export const camelize = (str: string) => {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/\s+/g, '')
}

export const vetDefault = (def: any): string | boolean | number | null => {
	if (def === null || def === undefined) return null
	if (def === 'true' || def === 'false') return def === 'true'
	if (String(+def) === def) return +def
	if (def === '') return null
	return `'${def}'`
}

export const mapAttrToGarph = (type: string) => {
	switch (type) {
		case 'id':
			return 'id()'
		case 'a_i':
			return 'int()'
		case 'varchar':
			return 'string()'
		case 'text':
			return 'string()'
		case 'base64':
			return 'string()'
		case 'password':
			return 'string()'
		case 'int':
			return 'int()'
		case 'float':
			return 'float()'
		case 'boolean':
			return 'boolean()'
		case 'datetime':
			return 'ref(DateType)'
		case 'date':
			return 'ref(DateType)'
		case 'time':
			return 'string()'
	}
}

export const mapAttrToDrizzleTypeName = (type: string) => {
	switch (type) {
		case 'id':
			return 'varchar'
		case 'a_i':
			return 'int'
		case 'varchar':
			return 'varchar'
		case 'text':
			return 'mediumtext'
		case 'base64':
			return 'mediumtext'
		case 'password':
			return 'varchar'
		case 'int':
			return 'int'
		case 'float':
			return 'float'
		case 'boolean':
			return 'boolean'
		case 'datetime':
			return 'datetime'
		case 'date':
			return 'date'
		case 'time':
			return 'time'
	}
}

export const mapAttrToDrizzleTypeFn = (attr: { name: string; type: string }) => {
	const name = attr.name

	switch (attr.type) {
		case 'id':
			return `varchar('${name}', { length: 15 })`
		case 'a_i':
			return `int('${name}').autoincrement()`
		case 'varchar':
			return `varchar('${name}', { length: 255 })`
		case 'text':
			return `mediumtext('${name}')`
		case 'base64':
			return `mediumtext('${name}')`
		case 'password':
			return `varchar('${name}', { length: 255 })`
		case 'int':
			return `int('${name}')`
		case 'float':
			return `float('${name}')`
		case 'boolean':
			return `boolean('${name}')`
		case 'datetime':
			return `datetime('${name}')`
		case 'date':
			return `date('${name}')`
		case 'time':
			return `time('${name}')`
	}
}

export const mapAttributeTypeToJs = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'varchar':
		case 'base64':
		case 'password':
		case 'date':
		case 'time':
		case 'datetime':
			return 'string'
		case 'int':
		case 'float':
		case 'a_i':
			return 'number'
		case 'boolean':
			return 'boolean'
		default:
			return 'string'
	}
}

export const mapAttributeTypeToGQL = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'varchar':
		case 'base64':
		case 'password':
		case 'date':
		case 'time':
		case 'datetime':
			return 'string'
		case 'int':
		case 'float':
		case 'a_i':
			return 'number'
		case 'boolean':
			return 'boolean'
		default:
			return 'string'
	}
}

export const mapAttrToGQLFilter = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'varchar':
		case 'base64':
		case 'password':
		case 'id':
			return 'StringFilter'
		case 'int':
		case 'float':
		case 'a_i':
			return 'NumberFilter'
		case 'boolean':
			return 'BooleanFilter'
		case 'date':
		case 'time':
		case 'datetime':
			return 'DateFilter'
		default:
			return 'StringFilter'
	}
}
