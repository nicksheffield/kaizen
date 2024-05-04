import { ModelCtx } from '@/generators/hono/contexts'
import { mapAttributeTypeToJs } from '@/generators/hono/utils'
import { ProjectCtx } from '@/generators/hono/types'
import { isNotNone } from '@/lib/utils'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const user = models.find((x) => project.settings.userModelId === x.id)

	if (!user) return ''

	return `import { db } from '@/lib/db.js'
	import { emailVerificationCodes, ${user.drizzleName} } from '@/schema.js'
	import { generateId } from 'lucia'
	import { TimeSpan, createDate } from 'oslo'
	import { generateRandomString, alphabet } from 'oslo/crypto'
	import { eq, or } from 'drizzle-orm'
	import { sendVerificationEmail } from '@/lib/email.js'
	import { HTTPException } from 'hono/http-exception'
	import { hashPassword, validatePassword } from '@/lib/password.js'
	
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

				return `${x.name}${isOptional ? '?' : ''}: ${mapAttributeTypeToJs(x.type)} ${isNullable ? '| null' : ''}${isOptional ? '| undefined' : ''}`
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
	
	export const createUser = async (email: string, password: string, fields: CreateUserFields) => {
		const userId = fields.id || generateId(15)
	
		const newUser = {
			...fields,
			email,
			id: userId,
		}
	
		await validatePassword(password)
	
		const existingUser = await db
			.select()
			.from(users)
			.where(
				or(
					eq(users.email, newUser.email),
					eq(users.id, newUser.id)
				)
			)
	
		if (existingUser.length) {
			throw new HTTPException(400, {
				message: 'Email already in use',
			})
		}
	
		const hashedPassword = await hashPassword(password)
	
		await db.insert(users).values({ ...newUser, password: hashedPassword })
	
		const verificationCode = await generateEmailVerificationCode(userId, email)
	
		sendVerificationEmail(email, userId, verificationCode)
	
		return db.query.users.findFirst({
			where: eq(users.id, userId),
		})
	}

	type UpdateUserFields = {
		${user?.attributes
			.map((x) => {
				if (!x.insertable) return null
				if (x.name === 'password') return null
				if (x.name === 'email') return null
				if (x.name === 'id') return null

				return `${x.name}?: ${mapAttributeTypeToJs(x.type)} | null | undefined`
			})
			.filter(isNotNone)
			.join('; ')}
		${user.foreignKeys
			.map((x) => {
				return `${x.name}${x.optional ? '?' : ''}: string | null | undefined`
			})
			.filter(isNotNone)
			.join('; ')}
	}
	
	export const updateUser = async (
		userId: string,
		email: string | undefined,
		password: string | undefined,
		fields: UpdateUserFields
	) => {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		})
	
		if (!user) {
			throw new HTTPException(404, {
				message: 'User not found',
			})
		}
	
		let hashedPassword: string | undefined = undefined
	
		if (password) {
			await validatePassword(password)
			hashedPassword = await hashPassword(password)
		}
	
		await db
			.update(users)
			.set({
				email,
				password: hashedPassword,
				${user?.attributes
					.map((x) => {
						if (!x.insertable) return null
						if (x.name === 'password') return null
						if (x.name === 'email') return null
						if (x.name === 'id') return null

						return `${x.name}: fields.${x.name} ?? undefined`
					})
					.filter(isNotNone)
					.join(', ')},
				${user.foreignKeys
					.map((x) => {
						return `${x.name}: fields.${x.name} ?? undefined`
					})
					.filter(isNotNone)
					.join(', ')}
			})
			.where(eq(users.id, userId))
	
		return db.query.users.findFirst({
			where: eq(users.id, userId),
		})
	}
	`
}

export default tmpl
