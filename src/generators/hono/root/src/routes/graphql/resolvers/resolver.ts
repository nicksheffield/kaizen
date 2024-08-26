import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'
import { mapAttrToGQLFilter, mapAttrToGarph } from '@/generators/hono/utils'
import { clean } from '@/generators/utils'
import { isNotNone, removeDuplicates } from '@/lib/utils'

const tmpl = ({ model, project }: { model: ModelCtx; project: ProjectCtx }) => {
	const nonSelectAttrs = model.attributes.filter((x) => !x.selectable)

	const authModel = project.models.find((x) => x.id === project.settings.userModelId)
	const isAuthModel = authModel?.id === model.id

	const relatedModels = model.relatedModels

	return `import { db } from '../../../lib/db.js'
	import { Resolvers } from '../router.js'
	import * as tables from '../../../schema.js'
	import {
		asc,
		desc,
		count,
		eq,
		inArray,
		Column,
		and,
		isNull,
		sql
	} from 'drizzle-orm'
	import { MySqlSelectDynamic, MySqlInsertDynamic, MySqlUpdateDynamic } from 'drizzle-orm/mysql-core'
	import { g, Infer } from 'garph'
	${isAuthModel ? `import { validateUser, userVerification } from '../../../lib/manageUser.js'` : ''}
	import { generateId } from 'lucia'
	${removeDuplicates(
		model.relatedModels.map((x) => {
			return `import * as ${x.otherModel.name} from './${x.drizzleName}.js'`
		})
	).join('\n')}
	import { removeDuplicates } from '../../../lib/utils.js'
	import { modifyQuery, modifyInsertMutation, modifyUpdateMutation, modifyDeleteMutation } from '../../../lib/modifiers.js'
	import { OrderDir, DateType } from './_utils.js'
	import * as filters from './_filters.js'
	import * as history from '../../../lib/history.js'
	${isAuthModel ? `import { hashPassword, validatePassword } from 'lib/password.js'` : ''}
	
	export const OrderBys = g.enumType('${model.name}OrderBy', [
		${model.attributes
			.map((x) => {
				if (!x.selectable) return null

				return `'${x.name}'`
			})
			.filter(isNotNone)
			.join(',')}
		${model.auditDates ? `,'createdAt', 'updatedAt', 'deletedAt'` : ''}
	] as const)
	
	// define the main type and its input types
	export const types = {
		type: g.type('${model.name}', {
			${model.attributes
				.map((x) => {
					if (!x.selectable) return null

					const optional = x.optional || x.generated

					return `${x.name}: g.${mapAttrToGarph(x.type)}${optional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.name}: g.id()${x.optional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
			${removeDuplicates(
				model.relatedModels
					.map((x) => {
						// use id or string? lets go with id for now
						return clean`${x.fieldName}: 
							g.ref(() => ${x.otherModel.name}.types.type)
							${x.isArray && '.list()'}
							${x.optional && '.optional()'}
							.omitResolver()
							${
								x.targetType === 'many' &&
								`.args({
								orderBy: g.ref(() => ${x.otherModel.name}.OrderBys).default('createdAt'),
								orderDir: g.ref(OrderDir).default('ASC'),
								where: g.ref(() => ${x.otherModel.name}.types.filter).optional(),
							})`
							}
							,`
					})
					.filter(isNotNone)
			).join('\n')}
			${model.auditDates ? `createdAt: g.ref(() => DateType), updatedAt: g.ref(() => DateType).optional(), deletedAt: g.ref(() => DateType).optional(),` : ''}
		}),
	
		collection: g.type('${model.name}Collection', {
			items: g.ref(() => types.type).list(),
			totalCount: g.int(),
		}),
	
		create: g.inputType('Create${model.name}Input', {
			${model.attributes
				.filter((x) => x.type !== 'a_i')
				.map((x) => {
					if (!x.insertable) return null
					if (x.generated) return null

					const isOptional = x.optional || x.default !== null || x.name === 'id'

					return `${x.name}: g.${mapAttrToGarph(x.type)}${isOptional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					const isOptional = x.optional

					// use id or string? lets go with id for now
					return `${x.name}: g.id()${isOptional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
		}),
	
		update: g.inputType('Update${model.name}Input', {
			${model.attributes
				.filter((x) => x.type !== 'a_i')
				.map((x) => {
					if (x.name === 'id') return `id: g.id(),`
					if (!x.insertable) return null
					if (x.generated) return null

					return `${x.name}: g.${mapAttrToGarph(x.type)}.optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.name}: g.id().optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
		}),
	
		filter: g.inputType('${model.name}Filter', {
			${model.attributes
				.map((x) => {
					if (!x.selectable) return null

					return `${x.name}: g.ref(filters.${mapAttrToGQLFilter(x.type)}).optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys.map((x) => `${x.name}: g.ref(filters.StringFilter).optional(),`).join('\n')}
			${model.relatedModels
				.map((x) => {
					return `${x.fieldName}: g.ref(() => ${x.otherModel.name}.types.filter).optional(),`
				})
				.join('\n')}
			and: g
				.ref(() => types.filter)
				.list()
				.optional(),
			or: g
				.ref(() => types.filter)
				.list()
				.optional(),
		}),
	}
	
	// setup data loaders for relations
	export const fieldResolvers: Resolvers['${model.name}'] = {
		${model.relatedModels
			.map((rel) => {
				let returnStmt = `return queries.map(
					(q) => ${rel.drizzleName}.${rel.isArray ? 'filter' : 'find'}((u) => u.${rel.oppositeKey} === q.parent.${rel.thisKey})!
				)`

				if (rel.isArray) {
					returnStmt = `return queries.map(
						(q) => ${rel.drizzleName}.${rel.isArray ? 'filter' : 'find'}((u) => u.${rel.oppositeKey} === q.parent.${rel.thisKey})!
					)`
				}

				return clean`${rel.fieldName}: {
				async loadBatch(queries) {
					${
						rel.targetType === 'many' &&
						`
						const args = queries[0]?.args
						const dir = args?.orderDir === 'ASC' ? asc : desc
						const field = args?.orderBy as keyof typeof tables.${rel.drizzleName}
						const orderBy = dir(tables.${rel.drizzleName}[field] as Column)
					`
					}
					const ${rel.drizzleName} = await db.query.${rel.drizzleName}.findMany({
						where: and(
							inArray(
								tables.${rel.drizzleName}.${rel.oppositeKey},
								removeDuplicates(queries.map((q) => q.parent.${rel.thisKey} ?? ''))
							),
							${model.auditDates && `isNull(tables.${rel.drizzleName}.deletedAt),`} 
							${rel.targetType === 'many' && `...filters.toWhere(tables.${rel.drizzleName}, args?.where)`} 
						),
						${rel.targetType === 'many' && `orderBy`}
					})
		
					${returnStmt}
				},
			}`
			})
			.join(',\n')}
	}
	
	// the types for the queries
	export const queryTypes = {
		${model.drizzleNameSingular}: g.ref(types.type).optional().args({
			id: g.id(),
		}),
	
		${model.drizzleName}: g.ref(types.collection).args({
			page: g.int().default(1),
			limit: g.int().default(0),
			orderBy: g.ref(OrderBys).default(${model.auditDates ? `'createdAt'` : `'id'`}),
			orderDir: g.ref(OrderDir).default('ASC'),
			where: g.ref(types.filter).optional(),
		}),
	}
	
	// the resolvers for the queries
	export const queryResolvers: Resolvers['Query'] = {
		${model.drizzleNameSingular}: async (_, args, c) => {
			const where = and(
				eq(tables.${model.drizzleName}.id, args.id),
				${model.auditDates ? `isNull(tables.${model.drizzleName}.deletedAt)` : ''}
			)

			let mainQ: MySqlSelectDynamic<any> | null = db
				.select({
					${model.attributes
						.filter((x) => x.selectable)
						.map((x) => `${x.name}: tables.${model.drizzleName}.${x.name},`)
						.join('\n')}
					${model.foreignKeys.map((x) => `${x.name}: tables.${model.drizzleName}.${x.name},`).join('\n')}
					${
						model.auditDates
							? `createdAt: tables.${model.drizzleName}.createdAt,
					updatedAt: tables.${model.drizzleName}.updatedAt,
					deletedAt: tables.${model.drizzleName}.deletedAt,`
							: ''
					}
				})
				.from(tables.${model.drizzleName})
				.where(where)
				.$dynamic()
	
			let cancelled = false
	
			const moddedQuery = modifyQuery('${model.drizzleNameSingular}', mainQ, {
				where,
				user: c.get('user'),
			})
			
			if (moddedQuery === null) {
				cancelled = true
			} else {
				mainQ = moddedQuery
			}
	
			const item = cancelled ? null : (await mainQ)[0]
	
			return item
		},
	
		${model.drizzleName}: async (_, args, c) => {
			const dir = args.orderDir === 'ASC' ? asc : desc
	
			const where = and(
				...filters.toWhere(tables.${model.drizzleName}, args.where),
				${model.auditDates ? `isNull(tables.${model.drizzleName}.deletedAt)` : ''}
			)

			let mainQ = db
				.select({
					${model.attributes
						.filter((x) => x.selectable)
						.map((x) => `${x.name}: tables.${model.drizzleName}.${x.name},`)
						.join('\n')}
					${model.foreignKeys.map((x) => `${x.name}: tables.${model.drizzleName}.${x.name},`).join('\n')}
					${
						model.auditDates
							? `createdAt: tables.${model.drizzleName}.createdAt,
					updatedAt: tables.${model.drizzleName}.updatedAt,
					deletedAt: tables.${model.drizzleName}.deletedAt,`
							: ''
					}
				})
				.from(tables.${model.drizzleName})
				.orderBy(
					dir(
						tables.${model.drizzleName}[
							args.orderBy as keyof typeof tables.${model.drizzleName}
						] as Column
					)
				)
				.where(where)
				.$dynamic()
	
			let moddedQuery = modifyQuery('${model.drizzleName}', mainQ, {
				where,
				user: c.get('user'),
			})
			
			if (moddedQuery === null) {
				return {
					items: [],
					totalCount: 0,
				}
			}
	
			if (args.limit) {
				moddedQuery = (moddedQuery as typeof mainQ)
					.limit(args.limit)
					.offset((args.page - 1) * args.limit)
			}
	
			const items = await moddedQuery
	
			const countQuery = modifyQuery('${model.drizzleName}', db
				.select({ totalCount: count() })
				.from(tables.${model.drizzleName})
				.where(where)
				.$dynamic(), {
					where,
					user: c.get('user'),
				})

			const [{ totalCount } = { totalCount: 0 }] = countQuery ? await countQuery : [{ totalCount: 0 }]

			return {
				items,
				totalCount,
			}
		},
	}
	
	// the types for the mutations
	export const mutationTypes = {
		create${model.name}: g
			.ref(types.type)
			.list()
			.args({
				data: g.ref(types.create).list(),
			}),
	
		update${model.name}: g
			.ref(types.type)
			.list()
			.args({
				data: g.ref(types.update).list(),
			}),
	
		delete${model.name}: g
			.ref(types.type)
			.list()
			.args({
				id: g.id().list(),
				${model.auditDates ? `softDelete: g.boolean().default(true),` : ''}
			}),
	}

	// the resolvers for the mutations
	export const mutationResolvers: Resolvers['Mutation'] = {
		create${model.name}: async (_, args, c) => {
			const results: ${relatedModels.length ? 'Omit<' : ''}Infer<typeof types.type>${relatedModels.length ? `, ${model.relatedModels.map((x) => `'${x.fieldName}'`).join('|')}>` : ''}[] = []
	
			for (const data of args.data) {
				const newId = data.id ?? generateId(15)

				const values = {
					...data,
					id: newId,
					${model.attributes
						// .filter((x) => x.default !== null)
						.filter((x) => x.insertable && !x.generated)
						.map((x) => {
							if (isAuthModel && x.type === 'password') {
								if (project.settings.auth.enableMagicLink)
									return `password: data.password ? await validateUser(data.email, data.password) : null,`
								return `password: await validateUser(data.email, data.password),`
							}
							if (x.name === 'id') return null
							return `${x.name}: data.${x.name} ?? undefined,`
						})
						.filter(isNotNone)
						.join('\n')}
					${model.relatedModels
						.map((x) => {
							if (x.otherModel.id !== authModel?.id) return null
							if (!x.defaultToAuth) return null
							return `${x.fieldName}Id: data.${x.fieldName}Id ?? c.get('user').id`
						})
						.filter(isNotNone)
						.join(',\n')}
				}
	
				const mainQ: MySqlInsertDynamic<any> = db
					.insert(tables.${model.drizzleName})
					.values(values)
					.$dynamic()

				const moddedQuery = await modifyInsertMutation(
					'create${model.name}',
					mainQ,
					{
						values,
						user: c.get('user'),
					}
				)

				if (moddedQuery) {
					await moddedQuery
					${isAuthModel ? `userVerification(newId, data.email)` : ''}
				}
	
				const item = await db.query.${model.drizzleName}.findFirst({
					${
						nonSelectAttrs.length > 0
							? `columns: {
						${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
						},`
							: ''
					}
					where: eq(tables.${model.drizzleName}.id, newId),
				})
				
				await history.create(
					'${model.tableName}',
					newId,
					data,
					c.get('user').id
				)
	
				if (item) results.push(item)
			}
	
			return results
		},
	
		update${model.name}: async (_, args, c) => {
			const results: ${relatedModels.length ? 'Omit<' : ''}Infer<typeof types.type>${relatedModels.length ? `, ${model.relatedModels.map((x) => `'${x.fieldName}'`).join('|')}>` : ''}[] = []
	
			for (const data of args.data) {
				const original = await db.query.${model.drizzleName}.findFirst({
					${
						nonSelectAttrs.length > 0
							? `columns: {
						${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
						},`
							: ''
					}
					where: eq(tables.${model.drizzleName}.id, data.id),
				})

				${
					isAuthModel
						? `
					let hashedPassword: string | undefined = undefined
		
					if (data.password) {
						await validatePassword(data.password)
						hashedPassword = await hashPassword(data.password)
					}
				`
						: ''
				}

				const values = {
					${model.attributes
						.filter((x) => x.insertable && !x.generated)
						.map((x) => {
							if (x.type === 'a_i') return null
							if (x.name === 'id') return null
							if (x.type === 'password') return `password: hashedPassword,`
							if (x.optional) return `${x.name}: data.${x.name},`
							return `${x.name}: data.${x.name} ?? undefined,`
						})
						.filter(isNotNone)
						.join('\n')}
					${model.foreignKeys
						.map((x) => {
							return `${x.name}: data.${x.name} ?? undefined,`
						})
						.join('\n')}
				}
				
				const mainQ: MySqlUpdateDynamic<any> = db
					.update(tables.${model.drizzleName})
					.set(values)
					.where(eq(tables.${model.drizzleName}.id, data.id))
					.$dynamic()
				
				const moddedQuery = await modifyUpdateMutation(
					'update${model.name}',
					mainQ,
					{
						// where,
						original,
						values,
						user: c.get('user'),
					}
				)

				if (moddedQuery) {
					await moddedQuery
				}
	
				const item = await db.query.${model.drizzleName}.findFirst({
					${
						nonSelectAttrs.length > 0
							? `columns: {
						${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
						},`
							: ''
					}
					where: eq(tables.${model.drizzleName}.id, data.id),
				})

				if (original) {
					await history.update(
						'${model.tableName}',
						data.id,
						original,
						data,
						c.get('user').id
					)
				}
	
				if (item) results.push(item)
			}
	
			return results
		},
	
		delete${model.name}: async (_, args, c) => {
			const items = await db.query.${model.drizzleName}.findMany({
				${
					nonSelectAttrs.length > 0
						? `columns: {
					${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
					},`
						: ''
				}
				where: inArray(tables.${model.drizzleName}.id, args.id),
			})
	
			for (const id of args.id) {
				${
					model.auditDates
						? `
				if (args.softDelete) {
					const query = db
						.update(tables.${model.drizzleName})
						.set({ deletedAt: new Date() })
						.where(eq(tables.${model.drizzleName}.id, id))
						.$dynamic()

					await modifyDeleteMutation('delete${model.name}', query, {
						where: eq(tables.${model.drizzleName}.id, id),
						user: c.get('user'),
					})
					
					history.softDelete('${model.tableName}', id, c.get('user').id)
				} else {
				`
						: ''
				}
					const query = db
						.delete(tables.${model.drizzleName})
						.where(eq(tables.${model.drizzleName}.id, id))
						.$dynamic()

					await modifyDeleteMutation('delete${model.name}', query, {
						where: eq(tables.${model.drizzleName}.id, id),
						user: c.get('user'),
					})
						
					history.hardDelete('${model.tableName}', id, c.get('user').id)
					${model.auditDates ? `}` : ''}
			}
	
			return items
		},
	}
	`
}

export default tmpl
