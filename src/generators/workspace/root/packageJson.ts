const tmpl = () => {
	const json = {
		scripts: {
			build: 'cd apps/client && vite build',
			start: 'cd apps/server && tsx src/index.ts',
		},
		dependencies: {
			tsx: '^4.7.1',
			vite: '^5.1.4',
		},
	}

	return JSON.stringify(json, null, 4)
}

export default tmpl
