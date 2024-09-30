const tmpl = () => {
	return `import { eq } from 'drizzle-orm'
import { db } from 'lib/db.js'
import { _apiKeys, _apps } from 'schema.js'
import { addDays } from 'date-fns'

export type App = {
	id: string
	name: string
	email: string

	twoFactorSecret: null
	twoFactorEnabled: false
	roles: string
}

type AppSession = {
	id: string
	expiresAt: Date
	fresh: boolean
	userId: string
}

type ValidApiKeyState = {
	app: App
	session: AppSession
}

type InvalidApiKeyState = {
	app: null
	session: null
}

export const validateApiKeySession = async (
	token: string
): Promise<ValidApiKeyState | InvalidApiKeyState> => {
	const [key] = await db
		.select()
		.from(_apiKeys)
		.where(eq(_apiKeys.key, token))

	const [app] = await db
		.select()
		.from(_apps)
		.where(eq(_apps.id, key?.appId || ''))

	if (!app || !key || key.revokedAt) {
		return { app: null, session: null }
	}

	return {
		app: {
			id: app.id,
			name: app.name,
			email: app.email,
			roles: app.roles,
			twoFactorSecret: null,
			twoFactorEnabled: false,
		},
		session: {
			id: key.id,
			userId: \`app:\${app.id}\`,
			expiresAt: addDays(new Date(), 1),
			fresh: false,
		},
	}
}

`
}

export default tmpl
