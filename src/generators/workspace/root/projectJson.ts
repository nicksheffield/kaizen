import { generateId } from '@/lib/utils'

const tmpl = () => {
	const json = {
		v: 3,
		settings: {
			id: generateId(15),
			name: 'New project',
			generator: 'hono',
			userModelId: undefined,
			useOrbStack: false,
			hasClient: false,
			auth: {
				requireAccountConfirmation: true,
				require2fa: false,
				sessionExpiry: '60',
				enableCookies: false,
				enableBearer: true,
				enableAuthenticator2fa: true,
				enableEmail2fa: false,
			},
		},
		models: [],
		relations: [],
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
