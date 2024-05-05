const tmpl = () => {
	const tsConfigJson = {
		$schema: 'https://json.schemastore.org/tsconfig',
		extends: '../../tsconfig.json',
		compilerOptions: {
			module: 'ESNext',
			moduleResolution: 'Bundler',
			allowJs: true,
			jsx: 'preserve',
			noEmit: true,
			baseUrl: 'src',
			paths: {
				'@/*': ['./*'],
			},
		},
		include: ['**/*.ts', '**/*.tsx'],
		exclude: ['node_modules'],
	}

	return JSON.stringify(tsConfigJson, null, 4)
}

export default tmpl
