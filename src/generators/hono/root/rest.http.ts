// import { ProjectCtx } from '@/generators/hono/types'

// const tmpl = ({ project }: { project: ProjectCtx }) => {
const tmpl = () => {
	const port = 3000

	return `### @name Login
POST http://localhost:${port}/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password",
  "otp": ""
}

### @name Logout
POST http://localhost:${port}/api/auth/logout

### @name ConfirmAccount
POST http://localhost:${port}/api/auth/confirm-account
Content-Type: application/json

{
  "code": "12531783",
  "userId": "l5cd2xu73yr6ryd"
}

### @name Setup2FA
POST http://localhost:${port}/api/auth/setup-twofactor

### @name Confirm2FA
POST http://localhost:${port}/api/auth/confirm-twofactor

### @name Disable2FA
POST http://localhost:${port}/api/auth/disable-twofactor

### @name Profile
GET http://localhost:${port}/api/auth/profile

### @name ResetPassword
POST http://localhost:${port}/api/auth/reset-password
Content-Type: application/json

{
  "email": "admin@example.com"
}

### @name ResetPasswordWithCode
POST http://localhost:${port}/api/auth/reset-password/bydmrkqn8u71o6k7qmay17rir4k9nigzrj5kfemt
Content-Type: application/json

{
  "password": "password"
}

### @name GetUsers
POST http://localhost:${port}/api/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query {
  users {
    items {
      id
      email
    }
    totalCount
  }
}
`
}

export default tmpl
