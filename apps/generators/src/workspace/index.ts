import { MODS_PATH, Project } from 'common/src/index'
import apps_mods_emails_ConfirmAccount from './root/apps/mods/emails/ConfirmAccount'
import apps_mods_emails_LoginCode from './root/apps/mods/emails/LoginCode'
import apps_mods_emails_ResetPassword from './root/apps/mods/emails/ResetPassword'
import apps_mods_emails_TwoFactorCode from './root/apps/mods/emails/TwoFactorCode'
import apps_mods_packageJson from './root/apps/mods/packageJson'
import apps_mods_src_api from './root/apps/mods/src/api'
import apps_mods_src_queries from './root/apps/mods/src/queries'
import apps_mods_src_seed from './root/apps/mods/src/seed'
import apps_mods_tsconfigJson from './root/apps/mods/tsconfigJson'
import gitignore from './root/gitignore'
import packageJson from './root/packageJson'
import pnpmWorkspace from './root/pnpm-workspace.yml'
import projectJson from './root/projectJson'
import tsconfigJson from './root/tsconfigJson'
import vscode_settings from './root/vscode/settings'
import vscode_tasks from './root/vscode/tasks'
import { WorkspaceGeneratorFn } from './types'
import { format } from './utils'

export const workspaceFiles = (project?: Project) => {
	const files = [
		'.gitignore',
		'package.json',
		'project.json',
		'tsconfig.json',
		'pnpm-workspace.yaml',

		'.vscode/settings.json',
		'.vscode/tasks.json',

		`${MODS_PATH}/tsconfig.json`,
		`${MODS_PATH}/package.json`,
		`${MODS_PATH}/src/api.ts`,
		`${MODS_PATH}/src/seed.ts`,
		`${MODS_PATH}/src/queries.ts`,
		`${MODS_PATH}/emails/ResetPassword.tsx`,
		`${MODS_PATH}/emails/TwoFactorCode.tsx`,
	]

	if (project?.settings.auth.requireAccountConfirmation) {
		files.push(`${MODS_PATH}/emails/ConfirmAccount.tsx`)
	}
	if (project?.settings.auth.enableMagicLink) {
		files.push(`${MODS_PATH}/emails/LoginCode.tsx`)
	}

	return files
}

export const generate: WorkspaceGeneratorFn = async ({ project, name }) => {
	const dir: Record<string, string> = {}

	dir['.gitignore'] = gitignore()
	dir['package.json'] = packageJson({ project })
	dir['project.json'] = projectJson({ name })
	dir['tsconfig.json'] = tsconfigJson()
	dir['pnpm-workspace.yaml'] = pnpmWorkspace()

	dir['.vscode/settings.json'] = vscode_settings({ project })
	dir['.vscode/tasks.json'] = vscode_tasks({ project })

	dir[`${MODS_PATH}/tsconfig.json`] = apps_mods_tsconfigJson()
	dir[`${MODS_PATH}/package.json`] = apps_mods_packageJson()
	dir[`${MODS_PATH}/src/api.ts`] = await format(apps_mods_src_api())
	dir[`${MODS_PATH}/src/seed.ts`] = await format(apps_mods_src_seed())
	dir[`${MODS_PATH}/src/queries.ts`] = await format(apps_mods_src_queries())
	dir[`${MODS_PATH}/emails/ResetPassword.tsx`] = await format(
		apps_mods_emails_ResetPassword({ project })
	)
	dir[`${MODS_PATH}/emails/TwoFactorCode.tsx`] = await format(
		apps_mods_emails_TwoFactorCode({ project })
	)

	if (project?.settings.auth.enableMagicLink) {
		dir[`${MODS_PATH}/emails/LoginCode.tsx`] = await format(
			apps_mods_emails_LoginCode({ project })
		)
	}

	if (project?.settings.auth.requireAccountConfirmation) {
		dir[`${MODS_PATH}/emails/ConfirmAccount.tsx`] = await format(
			apps_mods_emails_ConfirmAccount({ project })
		)
	}

	return dir
}
