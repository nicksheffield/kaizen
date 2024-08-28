import { Project } from '@/lib/projectSchemas'

const tmpl = ({ project }: { project?: Project }) => {
	return `import {
		Body,
		Container,
		Head,
		Heading,
		Html,
		Preview,
		Section,
		Tailwind,
		Text,
	} from '@react-email/components'
	import { alphabet, generateRandomString } from 'oslo/crypto'
	import * as React from 'react' // do not remove

	React // make vscode keep the import
	
	interface LoginCodeProps {
		code: string
	}
	
	const LoginCode = ({ code }: LoginCodeProps) => (
		<Html>
			<Head />
			<Preview>Your login code</Preview>
			<Tailwind>
				<Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
					<Container>
						<Section className="bg-white rounded-md border border-solid border-[#e4e4e7] px-4 pb-4 mt-8 mb-8">
							<Text className="text-sm">${project?.settings.name || 'Your Project'}</Text>
	
							<Text className="text-2xl tracking-tight font-bold text-gray-800">
								Login
							</Text>
	
							<Text className="text-gray-500 mt-0">
								Here is your login code. This is only valid for 5 minutes or until you request a new one.
							</Text>
	
							<Section className="bg-gray-100 rounded-lg vertical-align-middle mt-8">
								<Text className="text-3xl font-black text-center tracking-widest font-mono">
									{code}
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
	
	LoginCode.PreviewProps = {
		code: generateRandomString(6, alphabet('0-9')),
	} as LoginCodeProps
	
	export default LoginCode
	`
}

export default tmpl
