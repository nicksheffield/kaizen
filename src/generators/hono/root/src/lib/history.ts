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
		const values = Object.entries(data)
			.filter(([key]) => {
				return key !== '__typename' && key !== 'id'
			})
			.map(([column, value]) => ({
				id: generateId(15),
				table,
				column,
				value: String(value),
				rowId,
				operation: 'create',
				userId,
			}))
		await db.insert(history).values(values)
	}
	
	export const update = async (
		table: string,
		rowId: string,
		oldData: Record<string, any>,
		data: Record<string, any>,
		userId: string
	) => {
		const values = Object.entries(data)
			.filter(([key]) => {
				return key !== '__typename' && key !== 'id'
			})
			.filter(([key]) => {
				return String(oldData[key]) !== String(data[key])
			})
			.map(([column, value]) => ({
				id: generateId(15),
				table,
				column,
				value: String(value),
				rowId,
				operation: 'update',
				userId,
			}))
	
		await db.insert(history).values(values)
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
