import { stringify } from 'yaml'

const tmpl = () => {
	const obj = {
		packages: ['apps/*'],
	}

	return stringify(obj)
}

export default tmpl
