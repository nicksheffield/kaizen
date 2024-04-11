import { generateId, userModelFields } from '@/lib/utils'
import * as V1_0 from './v1.0'
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

export type Method = keyof typeof Method
export const Method = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
} as const
export const MethodUnion = z.union([z.literal('GET'), z.literal('POST'), z.literal('PUT'), z.literal('DELETE')])

export type Endpoint = z.infer<typeof EndpointSchema>
export const EndpointSchema = z.object({
	id: z.string(),
	name: z.string(),
	path: z.string(),
	queryParams: z.string(),
	body: z.string(),
	method: MethodUnion,
})

export type EndpointGroup = z.infer<typeof EndpointGroupSchema>
export const EndpointGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
})

export type Project = z.infer<typeof ProjectSchema>
export const ProjectSchema = z.object({
	v: z.literal(2),
	project: z.object({
		id: z.string(),
		name: z.string(),
		repoUrl: z.string().nullable(),
		generator: z.string().optional(),
		domainName: z.string().optional(),
		maxBodySize: z.string().optional(),
		connectionTimeout: z.number().optional(),
		userModelId: z.string().optional(),
		devDir: z.string().optional().default('dev'),
	}),
	settings: z.object({
		dev: z.object({
			customDomain: z.string().optional().default(''),
			appSrcDir: z.string().optional().default('/app/src'),
		}),
		production: z.object({
			keyPath: z.string().default('/etc/letsencrypt/live/example.com/privkey.pem'),
			certPath: z.string().default('/etc/letsencrypt/live/example.com/fullchain.pem'),
		}),
	}),
	auth: z
		.object({
			cookies: z.boolean().optional().default(true),
			bearer: z.boolean().optional().default(true),
			expiresIn: z.string().optional().default('60'),
		})
		.optional(),
	env: z
		.object({
			ACCESS_TOKEN_SECRET: z.string().optional(),
			REFRESH_TOKEN_SECRET: z.string().optional(),
			MARIADB_ROOT_PASSWORD: z.string().optional(),
			MYSQL_USER: z.string().optional(),
			MYSQL_PASSWORD: z.string().optional(),
			EMAIL_HOST: z.string().optional(),
			EMAIL_PORT: z.string().optional(),
			EMAIL_USER: z.string().optional(),
			EMAIL_PASS: z.string().optional(),
			EMAIL_FROM: z.string().optional(),
		})
		.optional(),
	models: z.array(ModelSchema),
	relations: z.array(RelationSchema),
})

export const upgrade = (project: V1_0.Project) => {
	const v1models = z.array(V1_0.ModelSchema).parse(project.models)
	const models = z.array(ModelSchema).parse(
		v1models.map((model) => {
			const isUser = model.name === 'User'

			const attrs = model.attributes
				.filter((x) => !x.foreignKey)
				.filter((x) => {
					if (!isUser) return true

					return x.name !== 'password' && x.name !== 'email'
				})
				.map((y) => ({
					...y,
					type: y.type === 'uuid' ? 'id' : y.type,
				}))

			return {
				...model,
				attributes: [...attrs, ...(isUser ? userModelFields.map((x) => ({ ...x, modelId: model.id })) : [])],
			}
		})
	)

	const relations = z.array(V1_0.RelationSchema).parse(project.relations)

	return ProjectSchema.parse({
		v: 2,
		project: {
			...project.project,
			id: generateId(),
			generator: 'hono',
			userModelId: models.find((x) => x.name === 'User')?.id,
			devDir: 'dev',
		},
		settings: {
			dev: {},
			production: {
				keyPath: '/etc/letsencrypt/live/example.com/privkey.pem',
				certPath: '/etc/letsencrypt/live/example.com/fullchain.pem',
			},
		},
		auth: {
			expiresIn: '60',
			bearer: true,
			cookies: true,
		},
		env: project.env,
		models,
		relations,
	})
}
