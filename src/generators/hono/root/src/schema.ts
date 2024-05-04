import { mapAttrToDrizzleTypeFn, mapAttrToDrizzleTypeName } from '../../utils'
import { ModelCtx } from '../../contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = (ctx: { models: ModelCtx[]; project: ProjectCtx }) => {
	const attrTypeImports = ctx.models.flatMap((x) => x.attributes).map((x) => mapAttrToDrizzleTypeName(x.type))
	const requiredTypeImports = ['mysqlTable', 'timestamp', 'varchar', 'datetime']

	const drizzleTypeImports = [...attrTypeImports, ...requiredTypeImports].filter((x, i, a) => a.indexOf(x) === i)

	const models = ctx.models

	return `import { relations, sql } from 'drizzle-orm'
import { ${drizzleTypeImports.join(', ')} } from 'drizzle-orm/mysql-core'

const auditDates = {
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt').onUpdateNow(),
	deletedAt: timestamp('deletedAt'),
}

/**
 * Auth Tables
 */
export const sessions = mysqlTable('_sessions', {
	id: varchar('id', { length: 15 }).primaryKey(),
	userId: varchar('userId', { length: 255 })
		.notNull()
		.references(() => users.id),
	expiresAt: datetime('expiresAt').notNull(),
})

export const emailVerificationCodes = mysqlTable('_email_verification_codes', {
	id: varchar('id', { length: 15 }).primaryKey(),
	code: varchar('code', { length: 255 }).notNull(),
	userId: varchar('userId', { length: 15 })
		.notNull()
		.references(() => users.id),
	email: varchar('email', { length: 255 }).notNull(),
	expiresAt: datetime('expiresAt').notNull(),
})

export const passwordResetToken = mysqlTable('_password_reset_token', {
	tokenHash: varchar('tokenHash', { length: 255 }).unique(),
	userId: varchar('userId', { length: 15 })
		.notNull()
		.references(() => users.id),
	expiresAt: datetime('expiresAt').notNull(),
})

export const recoveryCodes = mysqlTable('_recovery_codes', {
	codeHash: varchar('codeHash', { length: 255 }).unique().notNull(),
	userId: varchar('userId', { length: 15 })
		.notNull()
		.references(() => users.id),
})

export const history = mysqlTable('_history', {
	id: varchar('id', { length: 15 }).primaryKey(),
	table: varchar('table', { length: 255 }).notNull(),
	column: varchar('column', { length: 255 }).notNull(),
	value: mediumtext('value').notNull(),
	rowId: varchar('rowId', { length: 15 }).notNull(),
	operation: mediumtext('operation').notNull(),
	date: datetime('date')
		.default(sql\`'CURRENT_TIMESTAMP'\`)
		.notNull(),
	userId: varchar('userId', { length: 15 }).notNull(),
})

/**
 * Auth Relations
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}))

export const emailVerificationCodeRelations = relations(
	emailVerificationCodes,
	({ one }) => ({
		user: one(users, {
			fields: [emailVerificationCodes.userId],
			references: [users.id],
		}),
	})
)

export const passwordResetTokenRelations = relations(
	passwordResetToken,
	({ one }) => ({
		user: one(users, {
			fields: [passwordResetToken.userId],
			references: [users.id],
		}),
	})
)

export const recoveryCodesRelations = relations(recoveryCodes, ({ one }) => ({
	user: one(users, {
		fields: [recoveryCodes.userId],
		references: [users.id],
	}),
}))

/**
 * App Tables
 */
${models
	.map((model) => {
		return `export const ${model.drizzleName} = mysqlTable('${model.tableName}', {
	id: varchar('id', { length: 15 }).primaryKey(),
	${model.attributes
		.map((attr) => {
			if (attr.name === 'id') return

			// const isDateType = ['date', 'datetime', 'time'].includes(attr.type)
			// const def = isDateType && attr.default === "'CURRENT_TIMESTAMP'" ? 'sql`CURRENT_TIMESTAMP`' : attr.default
			const def = attr.default

			return `${attr.name}: ${mapAttrToDrizzleTypeFn(attr)}${def !== null ? `.default(sql\`${def}\`)` : ''}${!attr.optional ? '.notNull()' : ''},`
		})
		.filter((x) => x !== undefined)
		.join('\n\t')}

	${model.foreignKeys
		.map((fk) => {
			if (fk.name === 'id') return
			return `${fk.name}: varchar('${fk.name}', { length: 15 })${fk.optional ? '' : '.notNull()'}.references(() => ${fk.otherTable}.id),`
		})
		.filter((x) => x !== undefined)
		.join('\n\t')}
		
	${model.auditDates ? '...auditDates' : ''}
})
`
	})
	.join('\n')}

/**
 * App Relations
 */
${models
	.map((model) => {
		const relationTypes = [
			model.relatedModels.find((x) => x.targetType === 'one') ? 'one' : null,
			model.relatedModels.find((x) => x.targetType === 'many') ? 'many' : null,
		].filter((x) => !!x)

		if (relationTypes.length === 0) return null

		// ${relationTypes.join(', ')}
		return `export const ${model.drizzleName}Relations = relations(${model.tableName}, ({ one, many }) => ({
	${
		model.id === ctx.project.settings.userModelId
			? `sessions: many(sessions),
	emailVerificationCodes: many(emailVerificationCodes),
	passwordResetTokens: many(passwordResetToken),
	recoveryCodes: many(recoveryCodes),`
			: ''
	}
	${model.relatedModels
		.map((rel) => {
			// ${rel.side}
			if (rel.targetType === 'one') {
				return `${rel.fieldName}: one(${rel.tableName}, {
		fields: [${model.tableName}.${rel.thisKey}],
		references: [${rel.drizzleName}.${rel.oppositeKey}],
	})`
			}
			// ${rel.side}
			return `${rel.fieldName}: many(${rel.drizzleName})`
		})
		.join(',\n\t')}
}))
`
	})
	.filter((x) => !!x)
	.join('\n')}
`
}

export default tmpl
