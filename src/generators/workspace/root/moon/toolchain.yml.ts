import { stringify } from 'yaml'

const tmpl = () => {
	const obj = {
		$schema: 'https://moonrepo.dev/schemas/toolchain.json',
		node: {
			packageManager: 'pnpm',
		},
	}

	return stringify(obj)
}

export default tmpl
