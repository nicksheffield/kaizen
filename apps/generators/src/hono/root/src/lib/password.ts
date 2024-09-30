const tmpl = () => `import { HTTPException } from 'hono/http-exception'
import { alphabet, generateRandomString } from 'oslo/crypto'
import { Argon2id } from 'oslo/password'
import zxcvbn from 'zxcvbn'

// the fake password is used to prevent timing attacks
// we hash an unknown random string and use that as the fake password
// it's only 6 characters so there's literally no possibility of it matching a real password
const fakePassword = new Argon2id().hash(
	generateRandomString(6, alphabet('a-z'))
)

// check if a password matches a hash
export const verifyPassword = async (password: string, hash?: string) => {
	// we check a fake password to prevent timing attacks
	return new Argon2id().verify(hash || (await fakePassword), password)
}

// check if a potential password is strong enough
export const validatePassword = async (password: string) => {
	if (password.length < 8) {
		throw new HTTPException(400, {
			message: 'Password must be at least 8 characters',
		})
	}

	if (zxcvbn(password).score < 1) {
		throw new HTTPException(400, {
			message: 'Password is too weak',
		})
	}

	return true
}

// hash a password
export const hashPassword = (password: string) => {
	return new Argon2id().hash(password)
}
`

export default tmpl
