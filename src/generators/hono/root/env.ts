import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const proj = project.project
	const secrets = project.env
	const settings = project.settings

	if (!secrets) return ''

	return `DOMAINS=${proj.domainName ? `www.${proj.domainName},${proj.domainName}` : ''}
PORT=5555

# database connection
DB_URI=mysql://${secrets.MYSQL_USER}@${settings.dev.useOrbStack ? `db.${proj.name.toLowerCase().replace(/\s/g, '-')}.orb.local` : 'localhost'}:3306?password=${secrets.MYSQL_PASSWORD}&database=db

# email configuration
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=5df2197c6986f5
EMAIL_PASS=8ee4c83e163439
EMAIL_FROM=noreply@kz.com
`
}

export default tmpl
