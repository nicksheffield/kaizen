const tmpl = () => {
	const obj = {
		name: 'kaizen',
		scripts: {
			emails: 'email dev',
		},
		dependencies: {
			server: 'workspace:*',
			'@faker-js/faker': '^8.4.1',
			oslo: '^1.1.3',
			'drizzle-orm': '^0.30.1',
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
