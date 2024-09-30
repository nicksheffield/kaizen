import { ProjectCtx } from '../../types'

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const object: Record<string, any> = {}

	if (project?.settings.hasClient) {
		object['typescript.tsdk'] = 'apps/client/node_modules/typescript/lib'
		object['typescript.enablePromptUseWorkspaceTsdk'] = true
	}

	return JSON.stringify(object, null, 4)
}

export default tmpl
