const tmpl = () => {
	return `import { InferInsertModel, eq } from 'drizzle-orm'
import { MySqlTable, getTableConfig } from 'drizzle-orm/mysql-core'
import { db } from 'lib/db.js'
import { generateId } from 'lucia'
import * as history from 'lib/history.js'

/**
 * Create a new row in the database and log the action in the history table
 */
export const create = async <M extends MySqlTable>(
	table: M,
	data: Omit<InferInsertModel<M>, 'id'>,
	userId: string
) => {
	const { name, columns, ...config } = getTableConfig(table)

	const newId = generateId(15)
	const values = { id: newId, ...data }

	await db.insert(table).values(values as InferInsertModel<M>)
	await history.create(name, newId, values, userId)

	// @ts-ignore
	const where = eq(table.id, newId)
	return db.select().from(table).where(where)
}

/**
 * Update a row in the database and log the action in the history table
 */
export const update = async <M extends MySqlTable>(
	table: M,
	data: { id: string } & Partial<InferInsertModel<M>>,
	userId: string
) => {
	const { name, columns, ...config } = getTableConfig(table)

	// @ts-ignore
	const where = eq(table.id, data.id)
	const oldData = db.select().from(table).where(where)

	await db.update(table).set(data).where(where)
	await history.update(name, data.id, oldData, data, userId)

	return db.select().from(table).where(where)
}

/**
 * Remove a row from the database and log the action in the history table
 */
export const remove = async <M extends MySqlTable>(
	table: M,
	id: string,
	type: 'soft' | 'hard',
	userId: string
) => {
	const { name, columns, ...config } = getTableConfig(table)

	// @ts-ignore
	const where = eq(table.id, id)

	if (type === 'soft') {
		await db.update(table).set({ deletedAt: new Date() }).where(where)
		await history.softDelete(name, id, userId)
	} else {
		await db.delete(table).where(where)
		await history.hardDelete(name, id, userId)
	}
}
`
}

export default tmpl
