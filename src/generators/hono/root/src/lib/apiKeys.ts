const tmpl = () => {
	return `import { eq } from 'drizzle-orm'
import { db } from 'lib/db.js'
import { apiKeys } from 'schema.js'
import { addDays } from 'date-fns'

export type App = {
	id: string
	name: string
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
	const apps = await db.select().from(apiKeys).where(eq(apiKeys.key, token))
	const app = apps[0]

	if (!app || app.revokedAt) {
		return { app: null, session: null }
	}

	return {
		app: {
			id: app.id,
			name: app.name,
		},
		session: {
			id: app.id,
			userId: app.id,
			expiresAt: addDays(new Date(), 1),
			fresh: false,
		},
	}
}

`
}

export default tmpl
