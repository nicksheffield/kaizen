const tmpl = () => {
	const obj = {
		$schema: 'https://json.schemastore.org/tsconfig',
		extends: '../../tsconfig.json',
		include: ['.'],
		exclude: ['dist', 'build', 'node_modules'],
		compilerOptions: {
			strict: true,
			jsx: 'react-jsx',
		},
	}

	return JSON.stringify(obj, null, 4)
}

export default tmpl
