const tmpl = () => {
	return `import { db } from './db.js'
	import { history } from '../schema.js'
	import { and, eq } from 'drizzle-orm'
	
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
				const a = oldData[key] instanceof Date ? oldData[key].toISOString() : String(oldData[key])
				const b = data[key] instanceof Date ? data[key].toISOString() : String(data[key])
				return a !== b
			})
			.map(([column, value]) => ({
				table,
				column,
				value: value instanceof Date ? value.toISOString() : String(value),
				rowId,
				operation: 'update',
				userId,
			}))
	
		await db.insert(history).values(values)
	}

	export const softDelete = async (table: string, rowId: string, userId: string) => {
		await db.insert(history).values({
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
