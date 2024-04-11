const tmpl = () => `import { z } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const envSchema = z.object({
	NODE_ENV: z.string().optional(),
	PORT: z.string().optional(),

	DB_URI: z.string(),

	EMAIL_HOST: z.string(),
	EMAIL_PORT: z.string(),
	EMAIL_USER: z.string(),
	EMAIL_PASS: z.string(),
	EMAIL_FROM: z.string(),
})

export const env = envSchema.parse(process.env)

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}
`

export default tmpl
