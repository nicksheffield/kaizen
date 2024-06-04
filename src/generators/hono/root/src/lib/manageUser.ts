import { ModelCtx } from '@/generators/hono/contexts'
import { mapAttributeTypeToJs } from '@/generators/hono/utils'
import { ProjectCtx } from '@/generators/hono/types'
import { isNotNone } from '@/lib/utils'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const user = models.find((x) => project.settings.userModelId === x.id)

	if (!user) return ''

	return `import { db } from './db.js'
	import { emailVerificationCodes, ${user.drizzleName} } from '../schema.js'
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
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.userId, userId))
	
		const code = generateRandomString(8, alphabet('0-9'))
		await db.insert(emailVerificationCodes).values({
			id: generateId(15),
			userId,
			email,
			code,
			expiresAt: createDate(new TimeSpan(15, 'm')), // 15 minutes
		})
	
		return code
	}

	type CreateUserFields = {
		${user.attributes
			.map((x) => {
				if (!x.insertable) return null
				if (x.name === 'password') return null
				if (x.name === 'email') return null

				const isOptional = x.optional || x.default !== null || x.name === 'id'
				const isNullable = x.optional && x.name !== 'id'
				const canBeSQL = x.name !== 'id'

				return `${x.name}${isOptional ? '?' : ''}: ${mapAttributeTypeToJs(x.type)} ${isNullable ? '| null' : ''}${canBeSQL ? '| SQL' : ''}${isOptional ? ' | undefined' : ''}`
			})
			.filter(isNotNone)
			.join('; ')}
		${user.foreignKeys
			.map((x) => {
				// use id or string? lets go with id for now
				// return `${x.name}: g.id()${x.optional ? '.optional()' : ''},`
				return `${x.name}${x.optional ? '?' : ''}: string | null | undefined`
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
		const userId = fields.id || generateId(15)

		const hashedPassword = await validateUser(email, password)
	
		const values = {
			...fields,
			email,
			id: userId,
			password: hashedPassword,
		}
	
		await db.insert(${user.drizzleName}).values(values)

		await history.create('${user.tableName}', userId, values, _userId)
	
		await userVerification(userId, email)
	
		return db.query.${user.drizzleName}.findFirst({
			where: eq(${user.drizzleName}.id, userId),
		})
	}

	export const userVerification = async (userId: string, email: string) => {
		${
			project.settings.auth.requireAccountConfirmation
				? `
			const verificationCode = await generateEmailVerificationCode(userId, email)
		
			sendVerificationEmail(email, userId, verificationCode)
		`
				: ''
		}
	}

	export const throwOnUserExists = async (email: string) => {
		const existingUser = await db
			.select()
			.from(${user.drizzleName})
			.where(eq(${user.drizzleName}.email, email))
	
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
