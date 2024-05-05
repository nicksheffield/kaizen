const tmpl = () => {
	const obj = {
		name: 'transactional',
		version: '1.0.0',
		description: '',
		main: 'index.js',
		scripts: {
			emails: 'email dev',
		},
		keywords: [],
		author: '',
		license: 'ISC',
		dependencies: {
			'@react-email/components': '0.0.17',
			react: '^18.3.1',
			'react-email': '2.1.2',
		},
		devDependencies: {
			'@types/react': '^18.3.1',
		},
	}

	return JSON.stringify(obj, null, 4)
}

export default tmpl
