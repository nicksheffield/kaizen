const tmpl = () => {
	const packageJson = {
		name: 'server',
		main: 'index.ts',
		type: 'module',
		scripts: {
			dev: 'tsx --watch src/index.ts',
			studio: 'npx drizzle-kit studio',
			seed: 'tsx src/seed.ts',
			start: 'tsx src/index.ts',
		},
		peerDependencies: {
			typescript: '^5.0.0',
		},
		dependencies: {
			'@aws-sdk/client-s3': '^3.606.0',
			'@aws-sdk/s3-request-presigner': '^3.608.0',
			'@envelop/graphql-middleware': '^6.0.0',
			'@escape.tech/graphql-armor': '^2.4.0',
			'@faker-js/faker': '^8.4.1',
			'@graphql-yoga/plugin-disable-introspection': '^2.2.0',
			'@hono/node-server': '^1.8.2',
			'@hono/zod-validator': '^0.2.0',
			'@lucia-auth/adapter-drizzle': '^1.0.3',
			'@react-email/components': '^0.0.16',
			'@react-email/render': '^0.0.12',
			'@sentry/node': '^8.20.0',
			'@sentry/profiling-node': '^8.20.0',
			chalk: '^5.3.0',
			'date-fns': '^3.6.0',
			dotenv: '^16.4.5',
			'drizzle-kit': '^0.23.0',
			'drizzle-orm': '^0.32.1',
			garph: '^0.6.8',
			graphql: '^16.8.1',
			'graphql-shield': '^7.6.5',
			'graphql-yoga': '^5.1.1',
			hono: '^4.0.10',
			lucia: '^3.1.1',
			'mime-types': '^2.1.35',
			mysql2: '^3.9.2',
			nodemailer: '^6.9.12',
			'ns-migrate': '0.1.17',
			oslo: '^1.1.3',
			resend: '^3.2.0',
			svix: '^1.23.0',
			tsx: '^4.7.1',
			zod: '^3.22.4',
			zxcvbn: '^4.4.2',
		},
		devDependencies: {
			'@types/mime-types': '^2.1.4',
			'@types/nodemailer': '^6.4.14',
			'@types/zxcvbn': '^4.4.4',
		},
	}

	return JSON.stringify(packageJson, null, 4).replaceAll(/[" "]{4}/g, '\t')
}

export default tmpl
