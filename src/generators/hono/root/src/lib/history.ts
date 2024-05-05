const tmpl = () => {
	return `import { db } from './db.js'
	import { history } from '../schema.js'
	import { and, eq } from 'drizzle-orm'
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

	export const softDelete = async (table: string, rowId: string, userId: string) => {
		await db.insert(history).values({
			id: generateId(15),
			table: table,
			column: '',
			value: '',
			rowId,
			operation: 'delete',
			userId,
		})
	}
	
	export const hardDelete = async (table: string, rowId: string) => {
		await db
			.delete(history)
			.where(
				and(
					eq(history.table, 'venues'),
					eq(history.rowId, rowId)
				)
			)
	}
`
}

export default tmpl
