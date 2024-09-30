import { alphabet, generateRandomString } from 'oslo/crypto'
import { Attribute } from '../index'

export const generateId = (length: number = 5) =>
	generateRandomString(length, alphabet('0-9', 'a-z'))

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
		nullable: true,
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
	{
		id: 'm3t7y',
		name: 'locked',
		type: 'boolean',
		default: 'false',
		nullable: false,
		selectable: true,
		insertable: true,
		order: 8,
		enabled: true,
		modelId: '',
	},
]

export const getUserModelFields = (
	modelId: string,
	options: { hasMagicLink: boolean } = { hasMagicLink: false }
): Attribute[] => {
	return userModelFields.map((x) => {
		if (x.name === 'password')
			return { ...x, nullable: options.hasMagicLink, modelId }

		return { ...x, modelId }
	})
}

export const getIsUserAttr = (id: string) => {
	return userModelFields.some((x) => x.id === id)
}
