// import { useApp } from '@/lib/AppContext'
import { ApolloSandbox } from '@apollo/sandbox/react'

export const ProjectSandbox = () => {
	// const project = useApp((v) => v.project)

	return (
		<div className="min-h-0 flex-1">
			<ApolloSandbox initialEndpoint="http://localhost:3000/api/graphql" endpointIsEditable className="h-full" />
		</div>
	)
}
