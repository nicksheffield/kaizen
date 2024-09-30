import { snakeToCamel } from '@/lib/utils'
import { Project } from 'common/src'

const tmpl = ({ name: emailName, project }: { name: string; project: Project }) => {
	const name = snakeToCamel(emailName)

	return `import * as React from 'react' // do not remove
	import {
		Body,
		Container,
		Head,
		Html,
		Preview,
		Tailwind,
		Text,
	} from '@react-email/components'
	
	interface ${name}Props {
		//...
	}
	
	const ${name} = ({}: ${name}Props) => (
		<Html>
			<Head />
			<Preview>An email from ${project.settings.name}</Preview>
			<Tailwind>
				<Body className="bg-white my-auto mx-auto font-sans px-2">
					<Container>
						<Text className="text-2xl tracking-tight leading-5 text-gray-700 pt-12">
							${project.settings.name}
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
	
	${name}.PreviewProps = {
		// ...
	} as ${name}Props
	
	export default ${name}
	`
}

export default tmpl
