import { ProjectCtx } from '../types'

const tmpl = ({}: { project?: ProjectCtx }) => {
	const json = {
		scripts: {
			build: 'moon server:install client:install client:build',
			start: 'cd apps/server && tsx src/index.ts',
		},
		dependencies: {
			tsx: '^4.7.3',
		},
		devDependencies: {
			'@moonrepo/cli': '^1.24.3',
		},
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
