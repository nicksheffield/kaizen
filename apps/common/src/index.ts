import { Project } from './project'
export { parseProject, projectSchemas, projectVersion } from './project'
export * from './v3.0'
export const APPS_DIRNAME = 'apps'
export const SERVER_DIRNAME = 'server'
export const SERVER_PATH = `${APPS_DIRNAME}/${SERVER_DIRNAME}`
export const CLIENT_DIRNAME = `client`
export const CLIENT_PATH = `${APPS_DIRNAME}/${CLIENT_DIRNAME}`
export const MODS_DIRNAME = `mods`
export const MODS_PATH = `${APPS_DIRNAME}/${MODS_DIRNAME}`

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
