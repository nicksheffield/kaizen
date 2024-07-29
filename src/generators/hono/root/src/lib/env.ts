const tmpl = () => `import { z } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const envSchema = z.object({
	NODE_ENV: z.string().optional(),
	PORT: z.string().optional(),
	LOG_REQUESTS: z.string().optional(),

	DB_URI: z.string(),

	EMAIL_HOST: z.string().optional(),
	EMAIL_PORT: z.string().optional(),
	EMAIL_USER: z.string().optional(),
	EMAIL_PASS: z.string().optional(),
	EMAIL_FROM: z.string().optional(),
	DEV_EMAIL_TO: z.string().optional(),
	RESEND_API_KEY: z.string().optional(),
	RESEND_WEBHOOK_SECRET: z.string().optional(),

	SENTRY_DSN: z.string().optional(),

	EMAIL_BASEURL: z.string().optional(),
})

export const env = envSchema.parse(process.env)

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}

export const isDev = env.NODE_ENV !== 'production'
`

export default tmpl
