import { ProjectCtx } from '@/generators/workspace/types'

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const object: Record<string, any> = {}

	if (project?.settings.hasClient) {
		object['typescript.tsdk'] = 'node_modules/typescript/lib'
		object['typescript.enablePromptUseWorkspaceTsdk'] = true
	}

	return JSON.stringify(object, null, 4)
}

export default tmpl
