import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/hono/types'
import { mapAttributeTypeToZod } from '@/generators/hono/utils'
import { clean } from '@/generators/utils'
import { isNotNone } from '@/lib/utils'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)

	if (!authModel) return ''

	return `import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { TimeSpan } from 'lucia'
import { _recoveryCodes, _twoFactorTokens } from '../../schema.js'
import { rateLimit } from '../../middleware/rateLimit.js'
import { createUser } from 'lib/manageUser.js'
import { HTTPException } from 'hono/http-exception'

export const registerDTO = z.object({
	email: z.string(),
	password: z.string(),
	${authModel.attributes
		.map((x) => {
			if (!x.insertable) return null
			if (x.generated) return null
			if (x.name === 'id') return null
			if (x.name === 'password') return null
			if (x.name === 'email') return null
			if (x.name === 'roles') return null
			if (x.name === 'locked') return null

			const isOptional = x.optional || x.default !== null || x.name === 'id'
			const isNullable = x.optional && x.name !== 'id'

			return clean`${x.name}: z.${mapAttributeTypeToZod(x.type)}()${isOptional && '.optional()'}${isNullable && '.nullable()'},`
		})
		.filter(isNotNone)
		.join('')}
	${authModel.foreignKeys
		.map((x) => {
			// use id or string? lets go with id for now
			// return `${x.name}: g.id()${x.optional ? '.optional()' : ''},`
			return clean`${x.name}: z.string().optional().nullable()`
		})
		.filter(isNotNone)
		.join('; ')}
})

export const router = new Hono()

router.post(
	'/register',
	rateLimit(new TimeSpan(1, 'm'), 20),
	zValidator('json', registerDTO),
	async (c) => {
		const body: z.infer<typeof registerDTO> = await c.req.json()

		const { email, password, ...fields } = body

		const newUser = await createUser(
			body.email,
			body.password,
			fields,
			'system'
		)

		if (!newUser) {
			throw new HTTPException(400, {
				message: 'Something went wrong',
			})
		}

		return c.json({
			id: newUser.id,
			email: newUser.email,
		})
	}
)
`
}

export default tmpl
