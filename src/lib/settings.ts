import { generateId } from '@/lib/utils'
import { alphabet, generateRandomString } from 'oslo/crypto'

export type SettingList = Record<string, () => string>

const randomString = () => generateRandomString(32, alphabet('a-z', '0-9'))

export const secrets: SettingList = {
	ACCESS_TOKEN_SECRET: () => randomString(),
	REFRESH_TOKEN_SECRET: () => randomString(),
	MARIADB_ROOT_PASSWORD: () => generateId(6),
	MYSQL_USER: () => 'admin',
	MYSQL_PASSWORD: () => generateId(6),
	EMAIL_HOST: () => '',
	EMAIL_PORT: () => '',
	EMAIL_USER: () => '',
	EMAIL_PASS: () => '',
	EMAIL_FROM: () => '',
	RESEND_API_KEY: () => '',
}
