const tmpl = () => {
	return `import { env, isDev } from './lib/env.js'
	import { migrate as nsMigrate, LogLevel } from 'ns-migrate'
	import { readFileSync } from 'node:fs'
	import { fileURLToPath } from 'node:url'
	import path from 'node:path'
	
	const dirname = path.dirname(fileURLToPath(import.meta.url))
	
	export const migrate = () => {
		return nsMigrate(
			env.DB_URI,
			JSON.parse(readFileSync(path.join(dirname, '../schema.json'), 'utf8')),
			{ log: LogLevel.log, force: isDev }
		)
	}
	
	`
}

export default tmpl
