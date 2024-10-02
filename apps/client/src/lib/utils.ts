import { type ClassValue, clsx } from 'clsx'
import { alphabet, generateRandomString } from 'oslo/crypto'
import { singular } from 'pluralize'
import { twMerge } from 'tailwind-merge'

export type VoidPromise = void | Promise<void>

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

export const generateId = (length: number = 5) => generateRandomString(length, alphabet('0-9', 'a-z'))

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
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

export const removeDuplicates = <T>(list: T[]): T[] => {
	return list.filter((x, i, a) => a.indexOf(x) === i)
}

export const safeParse = <T>(str: string, fallback: T): T => {
	try {
		return JSON.parse(str)
	} catch {
		return fallback
	}
}

export const roundToNearest = (n: number, t: number) => Math.round(n / t) * t
export const ceilToNearest = (n: number, t: number) => Math.ceil(n / t) * t
