import { HonoGeneratorExtras } from '@/generators/hono/types'
import { MODS_DIRNAME } from '@/lib/constants'

const tmpl = ({ extras }: { extras: HonoGeneratorExtras }) => {
	const hasSeeder = extras.seeder

	return `import { sentry } from './middleware/sentry.js'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env, isDev } from './lib/env.js'
import { migrate } from './migrate.js'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import mime from 'mime-types'
import { fileExtensions, logger } from './lib/utils.js'
import { router } from './routes/index.js'
${hasSeeder ? `import seed from '${MODS_DIRNAME}/src/seed.js'` : ''}

const app = new Hono()

migrate().then(async () => {
	${
		hasSeeder
			? `if (!('default' in seed)) return

	if ('isInitial' in seed) {
		if (await (seed.isInitial as () => Promise<boolean>)()) {
			seed.default()
		}
	} else {
		// @ts-ignore
		return seed.default()
	}`
			: ''
	}
})

if (env.LOG_REQUESTS === 'true' || isDev) {
	app.use(logger)
}

app.use('*', sentry)

app.use(
	cors({
		// @TODO: Change this to use an the actual origin in prod. x=>x is fine for dev
		origin: (x) => x,
		credentials: true,
	})
)

app.use(
	secureHeaders({
		xFrameOptions: false,
		xXssProtection: false,
		crossOriginOpenerPolicy: 'cross-origin',
		crossOriginResourcePolicy: 'cross-origin',
	})
)

const dirname = path.dirname(fileURLToPath(import.meta.url))

app.route('/api', router)
	
app.get('*', async (c) => {
	const ext = c.req.path.split('.').slice(-1)[0]

	if (!ext) {
		return c.text('Not Found', 404)
	}

	const fileName = fileExtensions.includes(ext)
		? c.req.path
		: '/index.html'

	const filePath = path.join(dirname, '../../client/dist', fileName)

	if (!existsSync(filePath)) {
		return c.text('Not Found', 404)
	}

	const content = await readFile(filePath)

	return c.newResponse(content, 200, {
		'Content-Type': mime.lookup(fileName) || 'text/plain',
	})
})

if (isDev) showRoutes(app)

serve({
	port: +(env.PORT || 3000),
	fetch: app.fetch,
})

process.on('uncaughtException', (error) => {
	if (error.name === 'AbortError') return

	console.log(error)
	process.exit(1)
})
`
}

export default tmpl
