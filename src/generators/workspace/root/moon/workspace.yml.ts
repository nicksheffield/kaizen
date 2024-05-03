import { stringify } from 'yaml'

const tmpl = () => {
	const obj = {
		$schema: 'https://moonrepo.dev/schemas/workspace.json',
		projects: {
			client: 'apps/client',
			server: 'apps/server',
		},
		vcs: {
			manager: 'git',
			defaultBranch: 'main',
		},
	}

	return stringify(obj)
}

export default tmpl
