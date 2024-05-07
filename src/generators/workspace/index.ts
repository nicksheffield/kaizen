import { WorkspaceGeneratorFn } from './types'
import { format } from './utils'

import gitignore from './root/gitignore'
import packageJson from './root/packageJson'
import projectJson from './root/projectJson'
import tsconfigJson from './root/tsconfigJson'
import pnpmWorkspace from './root/pnpm-workspace.yml'
import vscode_settings from './root/vscode/settings'
import vscode_tasks from './root/vscode/tasks'
import apps_kaizen_tsconfigJson from './root/apps/kaizen/tsconfigJson'
import apps_kaizen_packageJson from './root/apps/kaizen/packageJson'
import apps_kaizen_src_seed from './root/apps/kaizen/src/seed'
import apps_kaizen_emails_ConfirmAccount from './root/apps/kaizen/emails/ConfirmAccount'
import apps_kaizen_emails_ResetPassword from './root/apps/kaizen/emails/ResetPassword'

export const workspaceFiles = [
	'.gitignore',
	'package.json',
	'project.json',
	'tsconfig.json',
	'pnpm-workspace.yaml',

	'.vscode/settings.json',
	'.vscode/tasks.json',

	'apps/kaizen/tsconfig.json',
	'apps/kaizen/package.json',
	'apps/kaizen/src/seed.ts',
	'apps/kaizen/emails/ConfirmAccount.tsx',
	'apps/kaizen/emails/ResetPassword.tsx',
]

export const generate: WorkspaceGeneratorFn = async ({ project }) => {
	const dir: Record<string, string> = {}

	dir['/.gitignore'] = gitignore()
	dir['/package.json'] = packageJson({ project })
	dir['/project.json'] = projectJson()
	dir['/tsconfig.json'] = tsconfigJson()
	dir['/pnpm-workspace.yaml'] = pnpmWorkspace()

	dir['/.vscode/settings.json'] = vscode_settings({ project })
	dir['/.vscode/tasks.json'] = vscode_tasks({ project })

	dir['apps/kaizen/tsconfig.json'] = apps_kaizen_tsconfigJson()
	dir['apps/kaizen/package.json'] = apps_kaizen_packageJson()
	dir['apps/kaizen/src/seed.ts'] = await format(apps_kaizen_src_seed())
	dir['apps/kaizen/emails/ConfirmAccount.tsx'] = await format(apps_kaizen_emails_ConfirmAccount({ project }))
	dir['apps/kaizen/emails/ResetPassword.tsx'] = await format(apps_kaizen_emails_ResetPassword({ project }))

	return dir
}
