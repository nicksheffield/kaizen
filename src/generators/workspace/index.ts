import { WorkspaceGeneratorFn } from './types'

import gitignore from './root/gitignore'
import packageJson from './root/packageJson'
import projectJson from './root/projectJson'
import tsconfigJson from './root/tsconfigJson'
import pnpmWorkspace from './root/pnpm-workspace.yml'
import kaizen_seed from './root/kaizen/seed'
import vscode_settings from './root/vscode/settings'
import vscode_tasks from './root/vscode/tasks'
import moon_toolchain from './root/moon/toolchain.yml'
import moon_workspace from './root/moon/workspace.yml'
import apps_client_moon from './root/apps/client/moon.yml'
import apps_transactional_tsconfigJson from './root/apps/transactional/tsconfigJson'
import apps_transactional_packageJson from './root/apps/transactional/packageJson'
import apps_transactional_emails_ConfirmAccount from './root/apps/transactional/emails/ConfirmAccount'
import apps_transactional_emails_ResetPassword from './root/apps/transactional/emails/ResetPassword'

export const workspaceFiles = [
	'.gitignore',
	'package.json',
	'project.json',
	'tsconfig.json',
	'pnpm-workspace.yml',
	'kaizen/seed.ts',
	'.vscode/settings.json',
	'.vscode/tasks.json',
	'.moon/toolchain.yml',
	'.moon/workspace.yml',
	'apps/client/moon.yml',
	'apps/transactional/tsconfig.json',
	'apps/transactional/package.json',
	'apps/transactional/emails/ConfirmAccount.tsx',
	'apps/transactional/emails/ResetPassword.tsx',
]

export const generate: WorkspaceGeneratorFn = async ({ project }) => {
	const dir: Record<string, string> = {}

	dir['/.gitignore'] = gitignore()
	dir['/package.json'] = packageJson({ project })
	dir['/project.json'] = projectJson()
	dir['/tsconfig.json'] = tsconfigJson()
	dir['/pnpm-workspace.yml'] = pnpmWorkspace()

	dir['/kaizen/seed.ts'] = kaizen_seed()

	dir['.moon/toolchain.yml'] = moon_toolchain()
	dir['.moon/workspace.yml'] = moon_workspace()

	dir['/.vscode/settings.json'] = vscode_settings()
	dir['/.vscode/tasks.json'] = vscode_tasks()

	dir['apps/client/moon.yml'] = apps_client_moon()

	dir['apps/transactional/tsconfig.json'] = apps_transactional_tsconfigJson()
	dir['apps/transactional/package.json'] = apps_transactional_packageJson()
	dir['apps/transactional/emails/ConfirmAccount.tsx'] = apps_transactional_emails_ConfirmAccount()
	dir['apps/transactional/emails/ResetPassword.tsx'] = apps_transactional_emails_ResetPassword()

	return dir
}
