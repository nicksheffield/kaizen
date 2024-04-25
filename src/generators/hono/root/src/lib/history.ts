const tmpl = () => {
	return `import { db } from '@/lib/db.js'
	import { history } from '@/schema.js'
	import { generateId } from 'lucia'
	
	export const create = async (
		table: string,
		rowId: string,
		data: Record<string, any>,
		userId: string
	) => {
		for (const key in data) {
			if (key === '__typename') continue
			if (key === 'id') continue
	
			await db.insert(history).values({
				id: generateId(15),
				table: table,
				column: key,
				value: String(data[key]),
				rowId,
				operation: 'create',
				userId,
			})
		}
	}

	export const update = async (
		table: string,
		rowId: string,
		oldData: Record<string, any>,
		data: Record<string, any>,
		userId: string
	) => {
		for (const key in data) {
			if (key === '__typename') continue
			if (key === 'id') continue

			if (String(oldData[key]) === String(data[key])) {
				continue
			}
	
			await db.insert(history).values({
				id: generateId(15),
				table: table,
				column: key,
				value: String(data[key]),
				rowId,
				operation: 'update',
				userId,
			})
		}
	}
`
}

export default tmpl
