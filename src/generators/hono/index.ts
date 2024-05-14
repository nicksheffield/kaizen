import { HonoGeneratorFn } from './types'
import { format } from './utils'
import { createModelCtx } from './contexts'

import envExample from './root/env.example'
import gitignore from './root/gitignore'
import restHttp from './root/rest.http'
import prettierRc from './root/prettierrc'
import schemaJson from './root/schema.json'
import packageJson from './root/package.json'
import tsconfigJson from './root/tsconfig.json'
import drizzleConfig from './root/drizzle.config'
import dockerCompose from './root/docker-compose'

import httpTest_test from './root/http-test/test.http'

import src_index from './root/src/index'
import src_migrate from './root/src/migrate'
import src_schema from './root/src/schema'

import src_lib_db from './root/src/lib/db'
import src_lib_email from './root/src/lib/email'
import src_lib_env from './root/src/lib/env'
import src_lib_history from './root/src/lib/history'
import src_lib_lucia from './root/src/lib/lucia'
import src_lib_manageUser from './root/src/lib/manageUser'
import src_lib_password from './root/src/lib/password'
import src_lib_utils from './root/src/lib/utils'

import src_middleware_authenticate from './root/src/middleware/authenticate'
import src_middleware_rateLimit from './root/src/middleware/rateLimit'

import src_routes from './root/src/routes/index'

import src_routes_webhooks_resend from './root/src/routes/webhooks/resend'

import src_routes_auth_login from './root/src/routes/auth/login'
import src_routes_auth_logout from './root/src/routes/auth/logout'
import src_routes_auth_profile from './root/src/routes/auth/profile'
import src_routes_auth_confirmAccount from './root/src/routes/auth/confirm-account'
import src_routes_auth_resetPassword from './root/src/routes/auth/reset-password'
import src_routes_auth_twoFactor from './root/src/routes/auth/two-factor'

import src_routes_graphql_router from './root/src/routes/graphql/router'
import src_routes_graphql_resolvers_filters from './root/src/routes/graphql/resolvers/_filters'
import src_routes_graphql_resolvers_utils from './root/src/routes/graphql/resolvers/_utils'
import src_routes_graphql_resolvers_resolver from './root/src/routes/graphql/resolvers/resolver'

export const generate: HonoGeneratorFn = async (project, extras) => {
	const models = project.models.map((model) => createModelCtx(model, project))

	const dir: Record<string, string> = {}

	dir['.env.example'] = envExample()
	dir['.gitignore'] = gitignore()
	dir['rest.http'] = restHttp()
	dir['.pretterrc'] = prettierRc()
	dir['schema.json'] = schemaJson({ models, project })
	dir['package.json'] = packageJson()
	dir['tsconfig.json'] = tsconfigJson()
	dir['drizzle.config.ts'] = drizzleConfig()
	dir['docker-compose.yml'] = dockerCompose({ project })

	dir['src/index.ts'] = await format(src_index({ extras }))
	dir['src/migrate.ts'] = await format(src_migrate())
	dir['src/schema.ts'] = await format(src_schema({ models, project }))

	dir['src/lib/db.ts'] = await format(src_lib_db({ models, project }))
	dir['src/lib/email.ts'] = await format(src_lib_email({ project, extras }))
	dir['src/lib/env.ts'] = await format(src_lib_env())
	dir['src/lib/history.ts'] = await format(src_lib_history())
	dir['src/lib/lucia.ts'] = await format(src_lib_lucia({ project }))
	dir['src/lib/manageUser.ts'] = await format(src_lib_manageUser({ models, project }))
	dir['src/lib/password.ts'] = await format(src_lib_password())
	dir['src/lib/utils.ts'] = await format(src_lib_utils({ extras }))

	dir['src/middleware/authenticate.ts'] = await format(src_middleware_authenticate({ project }))
	dir['src/middleware/rateLimit.ts'] = await format(src_middleware_rateLimit())

	dir['src/routes/index.ts'] = await format(src_routes({ project, extras }))

	dir['src/routes/webhooks/resend.ts'] = await format(src_routes_webhooks_resend())

	dir['src/routes/auth/login.ts'] = await format(src_routes_auth_login({ models, project }))
	dir['src/routes/auth/logout.ts'] = await format(src_routes_auth_logout({ project }))
	dir['src/routes/auth/profile.ts'] = await format(src_routes_auth_profile({ models, project }))
	dir['src/routes/auth/confirm-account.ts'] = await format(src_routes_auth_confirmAccount({ models, project }))
	dir['src/routes/auth/reset-password.ts'] = await format(src_routes_auth_resetPassword({ models, project }))
	dir['src/routes/auth/two-factor.ts'] = await format(src_routes_auth_twoFactor({ models, project }))

	dir['src/routes/graphql/router.ts'] = await format(src_routes_graphql_router({ models, project }))
	dir['src/routes/graphql/resolvers/_filters.ts'] = await format(src_routes_graphql_resolvers_filters())
	dir['src/routes/graphql/resolvers/_utils.ts'] = await format(src_routes_graphql_resolvers_utils())

	for (const model of models) {
		dir[`src/routes/graphql/resolvers/${model.drizzleName}.ts`] = await format(
			src_routes_graphql_resolvers_resolver({ model, project })
		)

		dir[`http-test/${model.drizzleName}.http`] = httpTest_test({ model })
	}

	return dir
}
