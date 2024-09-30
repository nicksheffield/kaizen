import { Project } from 'common/src'

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
	
	interface TwoFactorCodeProps {
		code: string
	}
	
	const TwoFactorCode = ({ code }: TwoFactorCodeProps) => (
		<Html>
			<Head />
			<Preview>Your 2fa login code</Preview>
			<Tailwind>
				<Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
					<Container>
						<Section className="bg-white rounded-md border border-solid border-[#e4e4e7] px-4 pb-4 mt-8 mb-8">
							<Text className="text-sm">${project?.settings.name || 'Your Project'}</Text>
	
							<Text className="text-2xl tracking-tight font-bold text-gray-800">
								Login
							</Text>
	
							<Text className="text-gray-500 mt-0">
								Here is your two factor login code. This is only
								valid for 5 minutes.
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
	
	TwoFactorCode.PreviewProps = {
		code: generateRandomString(6, alphabet('0-9')),
	} as TwoFactorCodeProps
	
	export default TwoFactorCode
	`
}

export default tmpl
