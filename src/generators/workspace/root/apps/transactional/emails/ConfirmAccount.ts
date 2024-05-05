const tmpl = () => {
	return `import * as React from 'react'
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
			<Preview>Confirm your account on XPO Showtime</Preview>
			<Tailwind>
				<Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
					<Container>
						<Section className="bg-white rounded-md border border-solid border-[#e4e4e7] px-4 pb-4 mt-8 mb-8">
							<Text className="text-sm -mb-4">XPO Showtime</Text>
							<Text className="text-2xl tracking-tight mb-8 font-bold text-gray-800">
								Confirm Account
							</Text>
							<Section className="bg-gray-100 rounded-lg vertical-align-middle my-8">
								<Text className="text-3xl font-black text-center tracking-widest font-mono">
									{validationCode}
								</Text>
							</Section>
							<Link
								href={\`\${confirmAccountUrl}?userId=\${userId}\`}
								target="_blank"
								className="text-blue-500 text-sm underline"
							>
								Click here to confirm your account
							</Link>
							<Text className="text-gray-500 mb-0">
								You will be asked top copy the numeric code above
							</Text>
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
