import { ProjectCtx } from '@/generators/hono/types'
import { stringify } from 'yaml'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = project.settings
	const secrets = project.env

	const db: Record<string, any> = {
		image: 'mariadb',
		restart: 'always',
		environment: {
			MYSQL_USER: secrets?.MYSQL_USER || '',
			MYSQL_PASSWORD: secrets?.MYSQL_PASSWORD || '',
			MYSQL_DATABASE: 'db',
			MARIADB_ROOT_PASSWORD: secrets?.MARIADB_ROOT_PASSWORD || '',
		},
		volumes: ['database:/var/lib/mysql'],
	}

	// if (settings.dev.customDomain) {
	// 	db.labels = [`dev.orbstack.domains=db.${settings.dev.customDomain}`]
	// }

	const adminer: Record<string, any> = {
		image: 'adminer',
		restart: 'always',
		links: ['db'],
	}

	if (!settings.dev.useOrbStack) {
		db.ports = ['3306:3306']
		adminer.ports = ['8080:8080']
	}

	const volumes = {
		database: null,
	}

	return stringify(
		{
			version: '3.1',
			name: project.project.name.toLowerCase().replace(/\s/g, '-'),
			services: {
				// node,
				db,
				adminer,
				// nginx
			},
			volumes,
		},
		null,
		4
	)
}

export default tmpl
