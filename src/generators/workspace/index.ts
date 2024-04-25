import { WorkspaceGeneratorFn } from './types'

import gitignore from './root/gitignore'
import packageJson from './root/packageJson'
import projectJson from './root/projectJson'
import vscode_settings from './root/vscode/settings'
import vscode_tasks from './root/vscode/tasks'
import kaizen_seed from './root/kaizen/seed'

export const workspaceFiles = [
	'.vscode/settings.json',
	'.vscode/tasks.json',
	'kaizen/seed.ts',
	'.gitignore',
	'package.json',
	'project.json',
]

export const generate: WorkspaceGeneratorFn = async ({ project }) => {
	const dir: Record<string, string> = {}

	dir['/.vscode/settings.json'] = vscode_settings()
	dir['/.vscode/tasks.json'] = vscode_tasks()

	dir['/kaizen/seed.ts'] = kaizen_seed()

	dir['/.gitignore'] = gitignore()
	dir['/package.json'] = packageJson({ project })
	dir['/project.json'] = projectJson()

	return dir
}
