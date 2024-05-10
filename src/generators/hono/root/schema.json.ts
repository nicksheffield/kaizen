import { camelize, lc } from '../utils'
import { ModelCtx } from '../contexts'
import { ProjectCtx } from '@/generators/hono/types'
import pluralize from 'pluralize'
import { z } from 'zod'
import { isNotNone } from '@/lib/utils'
import { RelationType } from '@/lib/projectSchemas'

const AttributeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	default: z.union([z.string(), z.number(), z.boolean()]).nullable().optional(),
	nullable: z.boolean(),
	selectable: z.boolean(),
	order: z.number(),
	enabled: z.boolean(),
	modelId: z.string(),
	foreignKey: z.boolean(),
})

const ModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	tableName: z.string(),
	auditDates: z.boolean(),
	posX: z.number(),
	posY: z.number(),
	enabled: z.boolean(),
	attributes: z.array(AttributeSchema),
})

const authModels: z.infer<typeof ModelSchema>[] = [
	{
		id: 'sessions',
		name: 'Session',
		tableName: '_sessions',
		auditDates: false,
		posX: 0,
		posY: 0,
		enabled: true,
		attributes: [
			{
				id: 'sessions-id',
				name: 'id',
				type: 'varchar',
				default: null,
				nullable: false,
				selectable: false,
				order: 0,
				enabled: true,
				modelId: 'session',
				foreignKey: false,
			},
			{
				id: 'sessions-userId',
				name: 'userId',
				type: 'id',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'session',
				foreignKey: true,
			},
			{
				id: 'sessions-expiresAt',
				name: 'expiresAt',
				type: 'datetime',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'session',
				foreignKey: true,
			},
		],
	},

	{
		id: 'email_verification_codes',
		name: 'EmailVerificationCodes',
		tableName: '_email_verification_codes',
		auditDates: false,
		posX: 0,
		posY: 0,
		enabled: true,
		attributes: [
			{
				id: 'email_verification_codes-id',
				name: 'id',
				type: 'id',
				default: null,
				nullable: false,
				selectable: false,
				order: 0,
				enabled: true,
				modelId: 'email_verification_codes',
				foreignKey: false,
			},
			{
				id: 'email_verification_codes-code',
				name: 'code',
				type: 'varchar',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'email_verification_codes',
				foreignKey: true,
			},
			{
				id: 'email_verification_codes-email',
				name: 'email',
				type: 'varchar',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'email_verification_codes',
				foreignKey: true,
			},
			{
				id: 'email_verification_codes-userId',
				name: 'userId',
				type: 'id',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'session',
				foreignKey: true,
			},
			{
				id: 'email_verification_codes-expiresAt',
				name: 'expiresAt',
				type: 'datetime',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'email_verification_codes',
				foreignKey: true,
			},
		],
	},

	{
		id: 'password_reset_token',
		name: 'PasswordResetToken',
		tableName: '_password_reset_token',
		auditDates: false,
		posX: 0,
		posY: 0,
		enabled: true,
		attributes: [
			{
				id: 'password_reset_token-tokenHash',
				name: 'tokenHash',
				type: 'varchar',
				default: null,
				nullable: false,
				selectable: false,
				order: 0,
				enabled: true,
				modelId: 'password_reset_token',
				foreignKey: false,
			},
			{
				id: 'password_reset_token-userId',
				name: 'userId',
				type: 'id',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'password_reset_token',
				foreignKey: true,
			},
			{
				id: 'password_reset_token-expiresAt',
				name: 'expiresAt',
				type: 'datetime',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'password_reset_token',
				foreignKey: true,
			},
		],
	},

	{
		id: 'recovery_codes',
		name: 'RecoveryCodes',
		tableName: '_recovery_codes',
		auditDates: false,
		posX: 0,
		posY: 0,
		enabled: true,
		attributes: [
			{
				id: 'token_hash-codeHash',
				name: 'codeHash',
				type: 'varchar',
				default: null,
				nullable: false,
				selectable: false,
				order: 0,
				enabled: true,
				modelId: 'token_hash',
				foreignKey: false,
			},
			{
				id: 'token_hash-userId',
				name: 'userId',
				type: 'id',
				default: null,
				nullable: false,
				selectable: false,
				order: 1,
				enabled: true,
				modelId: 'token_hash',
				foreignKey: true,
			},
		],
	},
]

const historyModel: z.infer<typeof ModelSchema> = {
	id: 'history',
	name: 'History',
	tableName: '_history',
	auditDates: false,
	posX: 648,
	posY: 456,
	enabled: true,
	attributes: [
		{
			id: '7gf72',
			name: 'id',
			type: 'a_i',
			default: null,
			nullable: false,
			selectable: true,
			order: -1,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: 'hcsy5',
			name: 'table',
			type: 'varchar',
			default: null,
			nullable: false,
			selectable: true,
			order: 0,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: 'e33dq',
			name: 'column',
			type: 'varchar',
			default: null,
			nullable: false,
			selectable: true,
			order: 1,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: 'ffn1d',
			name: 'value',
			type: 'text',
			default: null,
			nullable: false,
			selectable: true,
			order: 2,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: 'hcsy6',
			name: 'rowId',
			type: 'varchar',
			default: null,
			nullable: false,
			selectable: true,
			order: 3,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: '9dbst',
			name: 'operation',
			type: 'varchar',
			default: null,
			nullable: false,
			selectable: true,
			order: 4,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: '5j6mr',
			name: 'date',
			type: 'datetime',
			default: 'CURRENT_TIMESTAMP',
			nullable: false,
			selectable: true,
			order: 5,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
		{
			id: 'ab3uc',
			name: 'userId',
			type: 'id',
			default: null,
			nullable: false,
			selectable: true,
			order: 6,
			enabled: true,
			modelId: 'si7v8',
			foreignKey: false,
		},
	],
}

const emailLogsModel: z.infer<typeof ModelSchema> = {
	id: 'h19mm',
	name: 'emailLog',
	tableName: '_email_logs',
	auditDates: false,
	posX: 96,
	posY: 384,
	enabled: true,
	attributes: [
		{
			id: '46bcj',
			name: 'id',
			type: 'id',
			default: null,
			nullable: false,
			selectable: true,
			order: 0,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: '9mywt',
			name: 'emailId',
			type: 'varchar',
			default: null,
			nullable: true,
			selectable: true,
			order: 1,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'pnlLA',
			name: 'provider',
			type: 'varchar',
			default: null,
			nullable: true,
			selectable: true,
			order: 2,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'yc300',
			name: 'from',
			type: 'varchar',
			default: null,
			nullable: true,
			selectable: true,
			order: 3,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: '3vtct',
			name: 'to',
			type: 'varchar',
			default: null,
			nullable: true,
			selectable: true,
			order: 4,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'qq6hl',
			name: 'subject',
			type: 'text',
			default: null,
			nullable: true,
			selectable: true,
			order: 5,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'h4r8x',
			name: 'body',
			type: 'text',
			default: null,
			nullable: true,
			selectable: true,
			order: 6,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: '24bzl',
			name: 'initiated',
			type: 'datetime',
			default: 'CURRENT_TIMESTAMP',
			nullable: false,
			selectable: true,
			order: 7,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'e3a4w',
			name: 'sent',
			type: 'datetime',
			default: null,
			nullable: true,
			selectable: true,
			order: 8,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: '5fve1',
			name: 'delayed',
			type: 'datetime',
			default: null,
			nullable: true,
			selectable: true,
			order: 9,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'rqitf',
			name: 'delivered',
			type: 'datetime',
			default: null,
			nullable: true,
			selectable: true,
			order: 10,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
		{
			id: 'ycnxi',
			name: 'bounced',
			type: 'datetime',
			default: null,
			nullable: true,
			selectable: true,
			order: 11,
			enabled: true,
			modelId: 'h19mm',
			foreignKey: false,
		},
	],
}

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const appModels = models.map((model) => {
		return ModelSchema.parse({
			id: model.id,
			name: model.name,
			tableName: model.tableName,
			auditDates: model.auditDates,
			posX: model.posX,
			posY: model.posY,
			enabled: true,
			attributes: [
				...model.attributes.map((attr) => {
					const def = (() => {
						if (attr.default === 'null' || attr.default === null) return null
						if (attr.default === true) return 'true'
						if (attr.default === false) return 'false'
						if (attr.default === '') return null

						// console.log('def fell through', { attr, def: attr.default, type: typeof attr.default })

						return String(attr.default)
					})()

					return {
						id: attr.id,
						name: attr.name,
						type: attr.type,
						default: attr.name === 'id' ? null : attr.optional ? null : def,
						nullable: attr.optional,
						selectable: attr.selectable,
						order: attr.order,
						enabled: true,
						modelId: model.id,
						foreignKey: false,
					}
				}),
				...model.foreignKeys.map((fk) => ({
					id: fk.id,
					name: fk.name,
					type: 'id',
					default: null,
					nullable: fk.optional,
					selectable: true,
					order: fk.order,
					enabled: true,
					modelId: model.id,
					foreignKey: true,
				})),
			],
		})
	})

	const appRelations = project.relations
		.map((rel) => {
			const sourceModel = project.models.find((x) => x.id === rel.sourceId)
			const targetModel = project.models.find((x) => x.id === rel.targetId)

			if (!sourceModel || !targetModel) return null

			const sourceName = lc(
				pluralize(
					rel.sourceName || camelize(sourceModel?.key || sourceModel?.name || '') || 'A',
					rel.type === RelationType.manyToOne || rel.type === RelationType.manyToMany ? 2 : 1
				)
			)

			const targetName = lc(
				pluralize(
					rel.targetName || camelize(targetModel?.key || targetModel?.name || '') || 'B',
					rel.type === RelationType.oneToMany || rel.type === RelationType.manyToMany ? 2 : 1
				)
			)

			return {
				id: rel.id,
				type: rel.type,
				sourceId: rel.sourceId,
				sourceName,
				sourceOrder: rel.sourceOrder,
				targetId: rel.targetId,
				targetName,
				targetOrder: rel.targetOrder,
				optional: rel.optional,
				enabled: true,
			}
		})
		.filter(isNotNone)

	return JSON.stringify(
		{
			models: [...appModels, ...authModels, historyModel, emailLogsModel],
			relations: appRelations,
		},
		null,
		4
	)
}

export default tmpl
