import { secrets } from '@/lib/settings'
import { generateId } from '@/lib/utils'

const tmpl = () => {
	const json = {
		v: 2,
		project: {
			id: generateId(5),
			name: 'New Project',
			repoUrl: '',
			generator: 'hono',
			domainName: '',
			maxBodySize: '2mb',
			connectionTimeout: 10000,
			userModelId: '',
			devDir: 'api',
		},
		settings: {
			dev: {
				useOrbStack: true,
				appDir: '/app',
			},
			production: {},
		},
		auth: {
			cookies: true,
			bearer: true,
			expiresIn: '60',
		},
		env: {
			ACCESS_TOKEN_SECRET: secrets.ACCESS_TOKEN_SECRET(),
			REFRESH_TOKEN_SECRET: secrets.REFRESH_TOKEN_SECRET(),
			MARIADB_ROOT_PASSWORD: secrets.MARIADB_ROOT_PASSWORD(),
			MYSQL_USER: secrets.MYSQL_USER(),
			MYSQL_PASSWORD: secrets.MYSQL_PASSWORD(),
			EMAIL_HOST: secrets.EMAIL_HOST(),
			EMAIL_PORT: secrets.EMAIL_PORT(),
			EMAIL_USER: secrets.EMAIL_USER(),
			EMAIL_PASS: secrets.EMAIL_PASS(),
			EMAIL_FROM: secrets.EMAIL_FROM(),
		},
		models: [],
		relations: [],
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
