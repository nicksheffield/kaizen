import { ProjectCtx } from '@/generators/workspace/types'

type Task = {
	label: string
	type: string
	command: string
	isBackground: boolean
	args: string[]
	group: {
		kind: string
		isDefault: boolean
	}
	presentation: {
		reveal: string
		echo: boolean
		focus: boolean
		panel: string
	}
	problemMatcher: string
}

const tmpl = ({ project }: { project?: ProjectCtx }) => {
	const tasks: Task[] = []

	if (project?.settings.hasClient) {
		tasks.push({
			label: 'tsc watch',
			type: 'shell',
			command: 'apps/client/node_modules/.bin/tsc',
			isBackground: true,
			args: ['--watch', '--noEmit', '--project', './apps/client'],
			group: {
				kind: 'build',
				isDefault: true,
			},
			presentation: {
				reveal: 'never',
				echo: false,
				focus: false,
				panel: 'dedicated',
			},
			problemMatcher: '$tsc-watch',
		})
	}

	const object = {
		version: '2.0.0',
		tasks,
	}

	return JSON.stringify(object, null, 4)
}

export default tmpl
