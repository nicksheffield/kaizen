import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'

const tmpl = (ctx: { models: ModelCtx[]; project: ProjectCtx }) => {
	const { models, project } = ctx

	return `import { Context, Hono } from 'hono'
import { g, InferResolvers, buildSchema } from 'garph'
import { createYoga, maskError } from 'graphql-yoga'
import { rule, shield } from 'graphql-shield'
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { useGraphQLMiddleware } from '@envelop/graphql-middleware'
import { EnvelopArmorPlugin } from '@escape.tech/graphql-armor'
import { getSession, authDecorate } from '@/middleware/authenticate.js'
import { User as AuthUser, Session } from 'lucia'
import { env, isDev } from '@/lib/env.js'
import { isNotFalse, writeIntrospection } from '@/lib/utils.js'
import { existsSync } from 'node:fs'
${models.map((model) => `import * as ${model.name} from './resolvers/${model.drizzleName}.js'`).join('\n')}

export const router = new Hono()

const Query = g.type('Query', {
	${models.map((model) => `...${model.name}.queryTypes`).join(',\n\t')}
})

const Mutation = g.type('Mutation', {
	${models.map((model) => `...${model.name}.mutationTypes`).join(',\n\t')}
})

// https://github.com/stepci/garph/issues/83
export type Resolvers = InferResolvers<
	{
		Query: typeof Query
		Mutation: typeof Mutation
		${models.map((model) => `${model.name}: typeof ${model.name}.types.type`).join(',\n\t')}
	},
	{
		context: Context<{
			Variables: {
				user: AuthUser
				session: Session
			}
		}>
	}
>

const resolvers = {
	Query: {
		${models.map((model) => `...${model.name}.queryResolvers`).join(',\n\t')}
	},
	Mutation: {
		${models.map((model) => `...${model.name}.mutationResolvers`).join(',\n\t')}
	},
	${models.map((model) => `${model.name}: ${model.name}.fieldResolvers`).join(',\n\t')}
}

const schema = buildSchema({ g, resolvers })

${
	project.settings.dev.appDir
		? `if (isDev && existsSync('../app')) {
	writeIntrospection(schema, '../${project.settings.dev.appDir.replace(/^\//, '')}')
}`
		: ''
}

const isAuthenticated = rule({ cache: 'contextual' })(
	async (parent, args, ctx, info) => {
		const { user } = await getSession(ctx)
		if (!user) return new Error('Unauthenticated')
		return true
	}
)

const yoga = createYoga({
	schema,
	graphiql: false,
	graphqlEndpoint: '/api/graphql',
	plugins: [
		!isDev && useDisableIntrospection(),
		EnvelopArmorPlugin(),
		useGraphQLMiddleware([
			// all this bullshit is here to make it so you can introspect without auth, but everything else requires auth
			shield({
				Query: {
					...Object.keys(resolvers.Query).reduce<
						Record<string, typeof isAuthenticated>
					>((acc, key) => {
						acc[key] = isAuthenticated
						return acc
					}, {}),
				},
				Mutation: isAuthenticated,
			}),
		]),
	].filter(isNotFalse),
	maskedErrors: {
		// This is only here to let the "Unauthenticated" error through, because yoga masks every other error
		maskError(error, message, isDev) {
			if ((error as Error).message === 'Unauthenticated') {
				return error as Error
			}

			return maskError(error, message, isDev)
		},
	},
})

router.post('/', authDecorate, async (c) => {
	const response = await yoga.handle(c.req.raw, c)

	return c.json(await response.json())
})
`
}

export default tmpl
