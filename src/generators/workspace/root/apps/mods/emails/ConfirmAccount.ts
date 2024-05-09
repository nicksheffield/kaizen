import { Project } from '@/lib/projectSchemas'

const tmpl = ({ project }: { project?: Project }) => {
	return `import * as React from 'react' // do not remove
	import {
		Body,
		Container,
		Head,
		Heading,
		Html,
		Link,
		Preview,
		Section,
		Tailwind,
		Text,
	} from '@react-email/components'
	
	interface ConfirmAccountProps {
		confirmAccountUrl: string
		userId: string
		validationCode: string
	}
	
	const ConfirmAccount = ({
		confirmAccountUrl,
		userId,
		validationCode,
	}: ConfirmAccountProps) => (
		<Html>
			<Head />
			<Preview>Confirm your account</Preview>
			<Tailwind>
				<Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
					<Container>
						<Section className="bg-white rounded-md border border-solid border-[#e4e4e7] px-4 pb-4 mt-8 mb-8">
							<Text className="text-sm -mb-4">${project?.settings.name || 'Your Project'}</Text>
							<Text className="text-2xl tracking-tight font-bold text-gray-800">
								Confirm Account
							</Text>
							<Link
								href={\`\${confirmAccountUrl}?userId=\${userId}\`}
								target="_blank"
								className="text-blue-500 text-sm underline mt-8"
							>
								Click here to confirm your account
							</Link>
							<Text className="text-gray-500 mt-0">
								You will be asked to enter the code below
							</Text>
							<Section className="bg-gray-100 rounded-lg vertical-align-middle mt-8">
								<Text className="text-3xl font-black text-center tracking-widest font-mono">
									{validationCode}
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
	
	ConfirmAccount.PreviewProps = {
		confirmAccountUrl: 'http://example.com/confirm-account',
		userId: 'abcdefgh',
		validationCode: '05738611',
	} as ConfirmAccountProps
	
	export default ConfirmAccount
	`
}

export default tmpl
