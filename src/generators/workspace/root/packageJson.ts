import { ProjectCtx } from '@/generators/workspace/types'

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const scripts: Record<string, string> = {
		start: 'cd apps/server && tsx src/index.ts',
	}

	const dependencies: Record<string, string> = {
		tsx: '^4.7.1',
		typescript: '^5.2.2',
	}

	if (project?.settings.hasClient) {
		scripts.build = 'cd apps/client && vite build'
		dependencies.vite = '^5.1.4'
	}

	const json = {
		scripts,
		dependencies,
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
