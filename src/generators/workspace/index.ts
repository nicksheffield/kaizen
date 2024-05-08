import { WorkspaceGeneratorFn } from './types'
import { format } from './utils'

import gitignore from './root/gitignore'
import packageJson from './root/packageJson'
import projectJson from './root/projectJson'
import tsconfigJson from './root/tsconfigJson'
import pnpmWorkspace from './root/pnpm-workspace.yml'
import vscode_settings from './root/vscode/settings'
import vscode_tasks from './root/vscode/tasks'
import apps_mods_tsconfigJson from './root/apps/mods/tsconfigJson'
import apps_mods_packageJson from './root/apps/mods/packageJson'
import apps_mods_src_seed from './root/apps/mods/src/seed'
import apps_mods_emails_ConfirmAccount from './root/apps/mods/emails/ConfirmAccount'
import apps_mods_emails_ResetPassword from './root/apps/mods/emails/ResetPassword'
import { MODS_PATH } from '@/lib/constants'

export const workspaceFiles = [
	'.gitignore',
	'package.json',
	'project.json',
	'tsconfig.json',
	'pnpm-workspace.yaml',

	'.vscode/settings.json',
	'.vscode/tasks.json',

	`${MODS_PATH}/tsconfig.json`,
	`${MODS_PATH}/package.json`,
	`${MODS_PATH}/src/seed.ts`,
	`${MODS_PATH}/emails/ConfirmAccount.tsx`,
	`${MODS_PATH}/emails/ResetPassword.tsx`,
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

	dir[`${MODS_PATH}/tsconfig.json`] = apps_mods_tsconfigJson()
	dir[`${MODS_PATH}/package.json`] = apps_mods_packageJson()
	dir[`${MODS_PATH}/src/seed.ts`] = await format(apps_mods_src_seed())
	dir[`${MODS_PATH}/emails/ConfirmAccount.tsx`] = await format(apps_mods_emails_ConfirmAccount({ project }))
	dir[`${MODS_PATH}/emails/ResetPassword.tsx`] = await format(apps_mods_emails_ResetPassword({ project }))

	return dir
}
