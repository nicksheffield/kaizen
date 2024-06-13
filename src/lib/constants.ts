export const APPS_DIRNAME = 'apps'
export const SERVER_DIRNAME = 'server'
export const SERVER_PATH = `${APPS_DIRNAME}/${SERVER_DIRNAME}`
export const CLIENT_DIRNAME = `client`
export const CLIENT_PATH = `${APPS_DIRNAME}/${CLIENT_DIRNAME}`
export const MODS_DIRNAME = `mods`
export const MODS_PATH = `${APPS_DIRNAME}/${MODS_DIRNAME}`

export const envKeys = [
	'DB_URI',
	'RESEND_API_KEY',
	'SENDGRID_API_KEY',
	'EMAIL_HOST',
	'EMAIL_PORT',
	'EMAIL_USER',
	'EMAIL_PASS',
	'EMAIL_FROM',
	'DEV_EMAIL_TO',
	'RESEND_WEBHOOK_SECRET',
	'EMAIL_BASEURL',
	'LOG_REQUESTS',
] as const

export const envHints: Record<string, string> = {
	DB_URI: 'The URI to connect to the database.',
	EMAIL_HOST: 'The host of the email server.',
	EMAIL_PORT: 'The port of the email server.',
	EMAIL_USER: 'The username of the email server.',
	EMAIL_PASS: 'The password of the email server.',
	EMAIL_FROM: 'The email address to send emails from.',
	DEV_EMAIL_TO: 'The email address to send emails to in development.',
	RESEND_API_KEY: 'The API key to use for sending emails via resend.',
	RESEND_WEBHOOK_SECRET: 'The secret used to verify webhook requests from resend.',
	SENDGRID_API_KEY: 'The API key to use for sending emails via sendgrid.',
	EMAIL_BASEURL: 'The base URL to use for links in emails.',
	LOG_REQUESTS: 'Set this to "true" in production to log all requests.',
}
