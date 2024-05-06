import { ModelCtx } from '@/generators/hono/contexts'
import { plural, singular } from 'pluralize'

const tmpl = ({ model }: { model: ModelCtx }) => {
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

### @name Get${plural(model.name)}
POST http://localhost:${port}/api/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query Get${plural(model.name)}($page: Int, $limit: Int, $where: ${model.name}Filter, $orderBy: ${model.name}OrderBy, $orderDir: OrderDir) {
	${plural(model.drizzleName)}(page: $page, limit: $limit, where: $where, orderBy: $orderBy, orderDir: $orderDir) {
		items {
${model.attributes
	.filter((x) => x.selectable)
	.map((x) => `\t\t\t${x.name}`)
	.join('\n')}
		}
		totalCount
	}
}

### @name Get${singular(model.name)}
POST http://localhost:${port}/api/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

query Get${singular(model.name)}($id: ID) {
	${singular(model.drizzleName)}(id: $id) {
${model.attributes
	.filter((x) => x.selectable)
	.map((x) => `\t\t${x.name}`)
	.join('\n')}
	}
}

### @name Create${singular(model.name)}
POST http://localhost:${port}/api/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation Create${singular(model.name)}($data: [Create${model.name}!]!) {
	create${model.name} {
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
			return `\t\t// ${x.name}: ""`
		}
		if (x.optional) {
			return `\t\t// ${x.name}: ""`
		}
		if (x.default) {
			return `\t\t// ${x.name}: ${x.default}`
		}
		return `\t\t${x.name}: ""`
	})
	.join(',\n')}
	}]
}


### @name Update${singular(model.name)}
POST http://localhost:${port}/api/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation Update${singular(model.name)}($data: [Update${model.name}!]!) {
	update${model.name} {
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
			return `\t\t${x.name}: ""`
		}
		if (x.optional) {
			return `\t\t// ${x.name}: ""`
		}
		if (x.default) {
			return `\t\t// ${x.name}: ${x.default}`
		}
		return `\t\t// ${x.name}: ""`
	})
	.join(',\n')}
	}]
}

### @name Delete${singular(model.name)}
POST http://localhost:${port}/api/graphql
Content-Type: application/json
X-REQUEST-TYPE: GraphQL

mutation Delete${singular(model.name)}($id: [ID]!) {
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
