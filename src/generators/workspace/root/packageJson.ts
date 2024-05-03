import { ProjectCtx } from '../types'

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const json = {
		scripts: {
			'install:api': `cd ${project?.project.devDir || 'api'} && npm install`,
			'install:app': 'cd app && npm install',
			'build:app': `cd app && vite build --emptyOutDir --outDir ../${project?.project.devDir || 'api'}/public`,
			build: 'npm run install:api && npm run install:app && npm run build:app',
			start: `cd ${project?.project.devDir || 'api'} && tsx src/index.ts`,
		},
		dependencies: {
			tsx: '^4.7.3',
			vite: '^5.2.10',
		},
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
