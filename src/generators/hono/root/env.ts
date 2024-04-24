import { ProjectCtx } from '@/generators/hono/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const proj = project.project
	const secrets = project.env
	const settings = project.settings

	const emailFields = {
		EMAIL_HOST: secrets?.EMAIL_HOST,
		EMAIL_PORT: secrets?.EMAIL_PORT,
		EMAIL_USER: secrets?.EMAIL_USER,
		EMAIL_PASS: secrets?.EMAIL_PASS,
		EMAIL_FROM: secrets?.EMAIL_FROM,
		RESEND_API_KEY: secrets?.RESEND_API_KEY,
	}

	if (!secrets) return ''

	return `DOMAINS=${proj.domainName ? `www.${proj.domainName},${proj.domainName}` : ''}
PORT=5555

# database connection
DB_URI=mysql://${secrets.MYSQL_USER}@${settings.dev.useOrbStack ? `db.${proj.name.toLowerCase().replace(/\s/g, '-')}.orb.local` : 'localhost'}:3306?password=${secrets.MYSQL_PASSWORD}&database=db

# email configuration
${Object.entries(emailFields)
	.filter((x) => !!x[1])
	.map(([key, val]) => `${key}=${val}`)
	.join('\n')}
`
}

export default tmpl
