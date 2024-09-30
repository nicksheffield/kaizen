const tmpl = () => {
	const obj = {
		$schema: 'https://json.schemastore.org/tsconfig',
		display: 'Default',
		compilerOptions: {
			declaration: false,
			declarationMap: false,
			esModuleInterop: true,
			incremental: false,
			isolatedModules: true,
			lib: ['es2022', 'DOM', 'DOM.Iterable'],
			module: 'NodeNext',
			moduleDetection: 'force',
			moduleResolution: 'NodeNext',
			noUncheckedIndexedAccess: true,
			resolveJsonModule: true,
			skipLibCheck: true,
			strict: true,
			target: 'ES2022',
		},
	}

	return JSON.stringify(obj, null, 4)
}

export default tmpl
