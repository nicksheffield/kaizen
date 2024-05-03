const tmpl = () => {
	const object = {
		version: '2.0.0',
		tasks: [
			{
				label: 'tsc watch',
				type: 'shell',
				command: 'apps/client/node_modules/.bin/tsc',
				isBackground: true,
				args: ['--watch', '--noEmit', '--project', '.'],
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
			},
		],
	}

	return JSON.stringify(object, null, 4)
}

export default tmpl
