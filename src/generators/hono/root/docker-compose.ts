import { ProjectCtx } from '@/generators/hono/types'
import { stringify } from 'yaml'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = project.settings

	const db: Record<string, any> = {
		image: 'mariadb',
		restart: 'always',
		environment: {
			MYSQL_USER: 'user',
			MYSQL_PASSWORD: 'password',
			MYSQL_DATABASE: 'db',
			MARIADB_ROOT_PASSWORD: 'root',
		},
		volumes: ['database:/var/lib/mysql'],
	}

	const adminer: Record<string, any> = {
		image: 'adminer',
		restart: 'always',
		links: ['db'],
	}

	if (!settings.useOrbStack) {
		db.ports = ['3306:3306']
		adminer.ports = ['8080:8080']
	}

	const volumes = {
		database: null,
	}

	return stringify(
		{
			version: '3.1',
			name: project.settings.name.toLowerCase().replace(/\s/g, '-'),
			services: {
				db,
				adminer,
			},
			volumes,
		},
		null,
		4
	)
}

export default tmpl
