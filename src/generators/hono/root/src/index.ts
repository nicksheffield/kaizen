const tmpl = ({ importSeeder }: { importSeeder: boolean }) => {
	return `import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { mountRoutes } from '@/lib/mountRoutes.js'
import { showRoutes } from 'hono/dev'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env, isDev } from '@/lib/env.js'
import { migrate } from '@/migrate.js'
import { readFile } from 'node:fs/promises'
import mime from 'mime-types'
import { fileExtensions } from '@/lib/utils.js'
${importSeeder ? `import seed from '@/seed.js'` : ''}

const app = new Hono()

migrate().then(() => {
	${importSeeder ? 'return seed()' : ''}
})

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
	})
)

const dirname = path.dirname(fileURLToPath(import.meta.url))
mountRoutes('', path.join(dirname, 'routes')).then((router) => {
	app.route('/api', router)
	
	app.get('*', async (c) => {
		const ext = c.req.path.split('.').slice(-1)[0]

		const filePath = fileExtensions.includes(ext)
			? c.req.path
			: '/index.html'

		const content = await readFile(
			path.join(dirname, '../public', filePath),
			'utf8'
		)

		return c.text(content, 200, {
			'Content-Type': mime.lookup(filePath) || 'text/plain',
		})
	})

	if (isDev) showRoutes(app)
})

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
