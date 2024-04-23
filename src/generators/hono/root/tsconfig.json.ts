const tmpl = () => {
	const tsConfigJson = {
		compilerOptions: {
			target: 'ES6',
			lib: ['es2018', 'esnext.asynciterable'],
			module: 'NodeNext',
			allowJs: true,
			outDir: 'build',
			rootDir: 'src',
			strict: true,
			skipLibCheck: true,
			noImplicitAny: true,
			esModuleInterop: true,
			emitDecoratorMetadata: true,
			experimentalDecorators: true,
			moduleResolution: 'NodeNext',
			baseUrl: 'src',
			paths: {
				'@/*': ['./*'],
			},
		},
		include: ['src/**/*.ts'],
	}

	return JSON.stringify(tsConfigJson, null, 4)
}

export default tmpl
