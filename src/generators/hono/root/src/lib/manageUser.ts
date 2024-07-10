import { ModelCtx } from '@/generators/hono/contexts'
import { mapAttributeTypeToJs } from '@/generators/hono/utils'
import { ProjectCtx } from '@/generators/hono/types'
import { isNotNone } from '@/lib/utils'
import { clean } from '@/generators/utils'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const authModel = models.find((x) => project.settings.userModelId === x.id)

	if (!authModel) return ''

	return clean`import { db } from './db.js'
	import { _emailVerificationCodes, ${authModel.drizzleName} } from '../schema.js'
	import { generateId } from 'lucia'
	import { TimeSpan, createDate } from 'oslo'
	import { generateRandomString, alphabet } from 'oslo/crypto'
	import { eq, SQL } from 'drizzle-orm'
	import { sendVerificationEmail } from './email.js'
	import { HTTPException } from 'hono/http-exception'
	import { hashPassword, validatePassword } from './password.js'
	import * as history from './history.js'
	
	export const generateEmailVerificationCode = async (
		userId: string,
		email: string
	): Promise<string> => {
		await db
			.delete(_emailVerificationCodes)
			.where(eq(_emailVerificationCodes.userId, userId))
	
		const code = generateRandomString(8, alphabet('0-9'))
		await db.insert(_emailVerificationCodes).values({
			id: generateId(15),
			userId,
			email,
			code,
			expiresAt: createDate(new TimeSpan(15, 'm')), // 15 minutes
		})
	
		return code
	}

	type CreateUserFields = {
		${authModel.attributes
			.map((x) => {
				if (!x.insertable) return null
				if (x.name === 'password') return null
				if (x.name === 'email') return null

				const isOptional = x.optional || x.default !== null || x.name === 'id'
				const isNullable = x.optional && x.name !== 'id'
				const canBeSQL = x.name !== 'id'

				return clean`${x.name}${isOptional && '?'}: ${mapAttributeTypeToJs(x.type)} ${isNullable && '| null'}${canBeSQL && '| SQL'}${isOptional && ' | undefined'}`
			})
			.filter(isNotNone)
			.join('; ')}
		${authModel.foreignKeys
			.map((x) => {
				// use id or string? lets go with id for now
				// return `${x.name}: g.id()${x.optional ? '.optional()' : ''},`
				return clean`${x.name}${x.optional && '?'}: string | null | undefined`
			})
			.filter(isNotNone)
			.join('; ')}
	}
	
	export const createUser = async (
		email: string,
		password: string,
		fields: CreateUserFields,
		_userId: string
	) => {
		// check for existing user
		const existingUser = await db
			.select()
			.from(${authModel.drizzleName})
			.where(eq(${authModel.drizzleName}.email, email))

		if (existingUser.length) {
			throw new HTTPException(400, {
				message: 'Email already in use',
			})
		}

		const userId = fields.id || generateId(15)

		${
			project.settings.auth.enableMagicLink
				? `const hashedPassword = password ? await validateUser(email, password) : null`
				: `const hashedPassword = await validateUser(email, password)`
		}
	
		const values = {
			...fields,
			email,
			id: userId,
			password: hashedPassword,
		}
	
		await db.insert(${authModel.drizzleName}).values(values)

		await history.create('${authModel.tableName}', userId, values, _userId)
	
		${project.settings.auth.requireAccountConfirmation && `await userVerification(userId, email)`}
	
		return db.query.${authModel.drizzleName}.findFirst({
			where: eq(${authModel.drizzleName}.id, userId),
		})
	}

	export const userVerification = async (userId: string, email: string) => {
		${
			project.settings.auth.requireAccountConfirmation &&
			`const verificationCode = await generateEmailVerificationCode(userId, email)
					sendVerificationEmail(email, userId, verificationCode)
				`
		}
	}

	export const throwOnUserExists = async (email: string) => {
		const existingUser = await db
			.select()
			.from(${authModel.drizzleName})
			.where(eq(${authModel.drizzleName}.email, email))
	
		if (existingUser.length) {
			throw new HTTPException(400, {
				message: 'Email already in use',
			})
		}
	}
	
	export const validateUser = async (email: string, password: string) => {
		await validatePassword(password)
		await throwOnUserExists(email)
		const hashedPassword = await hashPassword(password)
		return hashedPassword
	}	
	`
}

export default tmpl
