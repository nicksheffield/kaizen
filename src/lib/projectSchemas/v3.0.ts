import * as V2_0 from './v2.0'
import { z } from 'zod'

export type AttributeType = keyof typeof AttributeType
export const AttributeType = {
	id: 'id',
	a_i: 'a_i',
	varchar: 'varchar',
	text: 'text',
	base64: 'base64',
	password: 'password',
	int: 'int',
	float: 'float',
	boolean: 'boolean',
	datetime: 'datetime',
	date: 'date',
	time: 'time',
} as const
export const AttributeTypeSchema = z.nativeEnum(AttributeType)

export type Attribute = z.infer<typeof AttributeSchema>
export const AttributeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: AttributeTypeSchema,
	default: z.string().nullable(),
	nullable: z.boolean(),
	selectable: z.boolean(),
	insertable: z.boolean().default(true),
	order: z.number(),
	enabled: z.boolean().optional(),
	modelId: z.string(),
})

export type Model = z.infer<typeof ModelSchema>
export const ModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	key: z.string().optional(),
	tableName: z.string(),
	auditDates: z.boolean(),
	posX: z.number(),
	posY: z.number(),
	enabled: z.boolean().optional(),
	attributes: z.array(AttributeSchema),
})

export type RelationType = keyof typeof RelationType
export const RelationType = {
	oneToOne: 'oneToOne',
	oneToMany: 'oneToMany',
	manyToOne: 'manyToOne',
	manyToMany: 'manyToMany',
} as const
export const RelationTypeUnion = z.union([
	z.literal('oneToOne'),
	z.literal('oneToMany'),
	z.literal('manyToOne'),
	z.literal('manyToMany'),
])

export type Relation = z.infer<typeof RelationSchema>
export const RelationSchema = z.object({
	id: z.string(),
	type: RelationTypeUnion,
	sourceId: z.string(),
	sourceName: z.string(),
	sourceOrder: z.number(),
	targetId: z.string(),
	targetName: z.string(),
	targetOrder: z.number(),
	optional: z.boolean(),
	enabled: z.boolean().optional(),
	sourceDefaultToAuth: z.boolean().optional(),
	targetDefaultToAuth: z.boolean().optional(),
})

export type Project = z.infer<typeof ProjectSchema>
export const ProjectSchema = z.object({
	v: z.literal(3),
	settings: z.object({
		id: z.string(),
		name: z.string(),
		generator: z.string(),
		userModelId: z.string().optional(),
		useOrbStack: z.boolean().default(false),
		hasClient: z.boolean().default(false),
		auth: z.object({
			requireAccountConfirmation: z.boolean().default(true),
			require2fa: z.boolean().default(false),
			sessionExpiry: z.string().default('60'),
			enableCookies: z.boolean().default(false),
			enableBearer: z.boolean().default(true),
			enableAuthenticator2fa: z.boolean().default(true),
			enableEmail2fa: z.boolean().default(false),
		}),
	}),
	models: z.array(ModelSchema),
	relations: z.array(RelationSchema),
})

const newUserAttrs = [
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

export const upgrade = (project: V2_0.Project) => {
	return ProjectSchema.parse({
		v: 3,
		settings: {
			id: project.project.id,
			name: project.project.name,
			generator: 'hono',
			userModelId: project.project.userModelId,
			useOrbStack: project.settings.dev.useOrbStack,
			auth: {
				requireAccountConfirmation: true,
				require2fa: false,
				sessionExpiry: project.auth?.expiresIn ?? '60',
				enableCookies: project.auth?.cookies ?? false,
				enableBearer: project.auth?.bearer ?? true,
				enableAuthenticator2fa: true,
				enableEmail2fa: false,
			},
		},
		models: project.models.map((x) =>
			x.id === project.project.userModelId
				? {
						...x,
						attributes: [
							...x.attributes.filter((x) => x.name !== 'locked'),
							...newUserAttrs.map((x) => ({ ...x, modelId: project.project.userModelId })),
						],
					}
				: x
		),
		relations: project.relations,
	})
}
