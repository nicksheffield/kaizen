import { alphabet, generateRandomString } from 'oslo/crypto'

export const generateId = (length: number = 5) =>
	generateRandomString(length, alphabet('0-9', 'a-z'))

export type Nullish = null | undefined | void
export type Falsish = false | Nullish

export const isNotFalsish = <T>(value: T | Falsish): value is T => {
	return value !== false && value != null
}

export const isNotNullish = <T>(value: T | Nullish): value is T => {
	return value !== undefined && value != null
}

export type None = undefined | '' | false | null

export const isNotNone = <T>(x: T | None): x is T => {
	return x !== undefined && x !== '' && x !== false && x !== null
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

export const clean = (strings: TemplateStringsArray, ...values: any[]) => {
	let result = ''

	for (let i = 0; i < strings.length; i++) {
		result += strings[i]

		if (
			i < values.length &&
			values[i] !== null &&
			values[i] !== undefined &&
			values[i] !== false
		) {
			result += values[i]
		}
	}

	return result
}

export const removeDuplicates = <T>(list: T[]): T[] => {
	return list.filter((x, i, a) => a.indexOf(x) === i)
}
