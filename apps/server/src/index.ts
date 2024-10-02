import bodyParser from 'body-parser'
import { parseProject } from 'common/src'
import cors from 'cors'
import express from 'express'
import { GeneratorFn, generators } from 'generators/src'
import { generate as workspaceGenerator } from 'generators/src/workspace'
import path from 'node:path'

const app = express()

app.use(bodyParser.json())
app.use(cors())

const clientDir = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDir))

app.post('/api/generate/project', async (req, res) => {
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

app.post('/api/generate/workspace', async (req, res) => {
	const project = parseProject(req.body.project)
	const name = req.body.name

	if (!project) {
		res.status(400).send('Invalid project')
		return
	}

	const generated = await workspaceGenerator({ project, name })

	res.send({ generated })
})

app.get('*', (req, res) => {
	res.sendFile(path.join(clientDir, 'index.html'))
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
	console.log(`KZ3 listening on port ${PORT}!`)
})
