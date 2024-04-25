import { type ClassValue, clsx } from 'clsx'
import { singular } from 'pluralize'
import { twMerge } from 'tailwind-merge'
import { alphabet, generateRandomString } from 'oslo/crypto'
import prettier from 'prettier'
import typescriptPlugin from 'prettier/plugins/typescript'
import estreePlugin from 'prettier/plugins/estree'
import { Attribute } from '@/lib/projectSchemas'

export const generateId = (length: number = 5) => generateRandomString(length, alphabet('0-9', 'a-z'))

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export type None = undefined | '' | false | null

export const isNotNone = <T>(x: T | None): x is T => {
	return x !== undefined && x !== '' && x !== false && x !== null
}

export const alphabetical = (a: string, b: string) => {
	return a < b ? -1 : a > b ? 1 : 0
}

export const snakeToCamel = (str: string) => {
	return str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase())
}

export const camelize = (str: string) => {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/\s+/g, '')
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

export const getSmallName = (model: { key: string; name: string }) => singular(model.key || camelize(model.name))
export const getBigName = (model: { key: string; name: string }) => uc(getSmallName(model))

export const safeParse = <T>(str: string, fallback: T): T => {
	try {
		return JSON.parse(str)
	} catch {
		return fallback
	}
}

export const userModelFields: Attribute[] = [
	{
		id: 'n0qx6',
		name: 'email',
		type: 'text',
		default: null,
		nullable: false,
		selectable: true,
		insertable: true,
		order: 2,
		enabled: true,
		modelId: '',
	},
	{
		id: 'yni7z',
		name: 'password',
		type: 'password',
		default: null,
		nullable: false,
		selectable: false,
		insertable: true,
		order: 3,
		enabled: true,
		modelId: '',
	},
	{
		id: 'c77ge',
		name: 'twoFactorSecret',
		type: 'text',
		default: '',
		nullable: true,
		selectable: false,
		insertable: false,
		order: 4,
		enabled: true,
		modelId: '',
	},
	{
		id: '5oa41',
		name: 'twoFactorEnabled',
		type: 'boolean',
		default: 'false',
		nullable: false,
		selectable: true,
		insertable: false,
		order: 5,
		enabled: true,
		modelId: '',
	},
	{
		id: '3c9u5',
		name: 'emailVerified',
		type: 'boolean',
		default: 'false',
		nullable: false,
		selectable: true,
		insertable: false,
		order: 6,
		enabled: true,
		modelId: '',
	},
	{
		id: 'viuvb',
		name: 'roles',
		type: 'text',
		default: 'default',
		nullable: false,
		selectable: true,
		insertable: true,
		order: 7,
		enabled: true,
		modelId: '',
	},
]

export const getUserModelFields = (modelId: string): Attribute[] => {
	return userModelFields.map((x) => ({ ...x, modelId }))
}

export const getIsUserAttr = (id: string) => {
	return userModelFields.some((x) => x.id === id)
}

export const roundToNearest = (n: number, t: number) => Math.round(n / t) * t

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
