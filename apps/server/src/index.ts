import bodyParser from 'body-parser'
import { parseProject } from 'common/src'
import cors from 'cors'
import express from 'express'
import { GeneratorFn, generators } from 'generators/src'

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
	res.send('')
})

app.post('/generate', async (req, res) => {
	const project = parseProject(req.body.project)

	const seeder = req.body.hasSeeder
	const api = req.body.hasApi
	const queries = req.body.hasQueries
	const emails = req.body.emails

	const generate: GeneratorFn | undefined =
		generators[project.settings.generator as keyof typeof generators]

	if (!generate) {
		res.status(400).send('Invalid generator')
	}

	const generated = await generate(project, {
		seeder,
		api,
		queries,
		emails,
	})

	res.send({ generated })
})

app.listen(3333, () => {
	console.log('Example app listening on port 3333!')
})
