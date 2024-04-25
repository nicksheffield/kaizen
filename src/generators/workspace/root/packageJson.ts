import { ProjectCtx } from '../types'

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const json = {
		scripts: {
			build: `bun install --cwd ${project?.project.devDir || 'api'} && bun install --cwd app && vite build app --outDir ../api/public`,
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
