import { stringify } from 'yaml'

const tmpl = () => {
	const obj = {
		$schema: 'https://moonrepo.dev/schemas/tasks.json',
		language: 'javascript',
		tasks: {
			install: {
				command: 'pnpm install',
			},
		},
	}

	return stringify(obj)
}

export default tmpl
