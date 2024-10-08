import { ProjectCtx } from '../types'

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const scripts: Record<string, string> = {}

	scripts['server'] = 'pnpm --filter server'

	if (project?.settings.hasClient) {
		scripts['client'] = 'pnpm --filter client'
		scripts.build = 'pnpm --filter client build'
	}

	scripts['start'] = 'pnpm --filter server start'
	scripts['dev'] = 'pnpm --recursive --parallel --stream run dev'

	const dependencies: Record<string, string> = {
		tsx: '^4.7.1',
		typescript: '^5.2.2',
	}

	if (project?.settings.hasClient) {
		dependencies.vite = '^5.1.4'
	}

	const json = {
		scripts,
		dependencies,
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
