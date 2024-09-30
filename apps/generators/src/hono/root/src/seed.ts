const tmpl = () => {
	return `import { connection } from 'lib/db.js'
	import seed from 'mods/src/seed.js'

	const run = async () => {
		console.log('seeding...')
		await seed.default()
		await connection.end()
		console.log('done')
		process.exit()
	}

	run()
`
}

export default tmpl
