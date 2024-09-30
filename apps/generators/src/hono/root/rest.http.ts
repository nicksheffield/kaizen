// import { ProjectCtx } from '@/generators/hono/types'

// const tmpl = ({ project }: { project: ProjectCtx }) => {
const tmpl = () => {
	const port = 3000

	return `@baseUrl = http://localhost:${port}
@api = {{baseUrl}}/api
  
### @name Login
POST {{api}}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password",
  "otp": ""
}

### @name Logout
POST {{api}}/auth/logout

### @name ConfirmAccount
POST {{api}}/auth/confirm-account
Content-Type: application/json

{
  "code": "12531783",
  "userId": "l5cd2xu73yr6ryd"
}

### @name Setup2FA
POST {{api}}/auth/setup-twofactor

### @name Confirm2FA
POST {{api}}/auth/confirm-twofactor

### @name Disable2FA
POST {{api}}/auth/disable-twofactor

### @name Profile
GET {{api}}/auth/profile

### @name ResetPassword
POST {{api}}/auth/reset-password
Content-Type: application/json

{
  "email": "admin@example.com"
}

### @name ResetPasswordWithCode
POST {{api}}/auth/reset-password/bydmrkqn8u71o6k7qmay17rir4k9nigzrj5kfemt
Content-Type: application/json

{
  "password": "password"
}
`
}

export default tmpl
