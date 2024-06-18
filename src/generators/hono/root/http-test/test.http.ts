import { ModelCtx } from '@/generators/hono/contexts'
import { uc } from '@/lib/utils'

const tmpl = ({ model }: { model: ModelCtx }) => {
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

### @name Get${uc(model.drizzleName)}
POST {{api}}/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query Get${uc(model.drizzleName)}($page: Int, $limit: Int, $where: ${model.name}Filter, $orderBy: ${model.name}OrderBy, $orderDir: OrderDir) {
	${model.drizzleName}(page: $page, limit: $limit, where: $where, orderBy: $orderBy, orderDir: $orderDir) {
		items {
${model.attributes
	.filter((x) => x.selectable)
	.map((x) => `\t\t\t${x.name}`)
	.join('\n')}
		}
		totalCount
	}
}

### @name Get${uc(model.drizzleNameSingular)}
POST {{api}}/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query Get${uc(model.drizzleNameSingular)}($id: ID!) {
	${model.drizzleNameSingular}(id: $id) {
${model.attributes
	.filter((x) => x.selectable)
	.map((x) => `\t\t${x.name}`)
	.join('\n')}
	}
}

{
	"id": ""
}

### @name Create${uc(model.drizzleNameSingular)}
POST {{api}}/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation Create${uc(model.drizzleNameSingular)}($data: [Create${model.name}!]!) {
	create${model.name}(data: $data) {
${model.attributes
	.filter((x) => x.selectable)
	.map((x) => `\t\t${x.name}`)
	.join('\n')}
	}
}

{
	"data": [{
${model.attributes
	.filter((x) => x.insertable)
	.map((x) => {
		if (x.name === 'id') {
			return `\t\t// "${x.name}": ""`
		}
		if (x.optional) {
			return `\t\t// "${x.name}": ""`
		}
		if (x.default) {
			return `\t\t// "${x.name}": ${x.default}`
		}
		return `\t\t"${x.name}": ""`
	})
	.join(',\n')}
	}]
}


### @name Update${uc(model.drizzleNameSingular)}
POST {{api}}/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation Update${uc(model.drizzleNameSingular)}($data: [Update${model.name}!]!) {
	update${model.name}(data: $data) {
${model.attributes
	.filter((x) => x.selectable)
	.map((x) => `\t\t${x.name}`)
	.join('\n')}
	}
}

{
	"data": [{
${model.attributes
	.filter((x) => x.insertable)
	.map((x) => {
		if (x.name === 'id') {
			return `\t\t"${x.name}": ""`
		}
		if (x.optional) {
			return `\t\t// "${x.name}": ""`
		}
		if (x.default) {
			return `\t\t// "${x.name}": ${x.default}`
		}
		return `\t\t// "${x.name}": ""`
	})
	.join(',\n')}
	}]
}

### @name Delete${uc(model.drizzleNameSingular)}
POST {{api}}/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation Delete${uc(model.drizzleNameSingular)}($id: [ID]!) {
	delete${model.name} {
		id
	}
}

{
	"id": [""]
}
`
}

export default tmpl
