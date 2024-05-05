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
	
	interface ResetPasswordProps {
		resetPasswordUrl: string
		resetCode: string
	}
	
	const ResetPassword = ({ resetPasswordUrl, resetCode }: ResetPasswordProps) => (
		<Html>
			<Head />
			<Preview>Reset your password for XPO Showtime</Preview>
			<Tailwind>
				<Body className="bg-[#f4f4f5] my-auto mx-auto font-sans px-2">
					<Container>
						<Section className="bg-white rounded-md border border-solid border-[#e4e4e7] px-4 pb-4 mt-8">
							<Text className="text-sm -mb-4">XPO Showtime</Text>
							<Text className="text-2xl tracking-tight mb-8 font-bold text-gray-800">
								Reset Password
							</Text>
							<Link
								href={\`\${resetPasswordUrl}?code=\${resetCode}\`}
								target="_blank"
								className="text-blue-500 text-sm underline"
							>
								Click here to reset your password
							</Link>
							<Text className="text-gray-500 mb-0">
								If you did not request a password reset, please
								ignore this email.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
	
	ResetPassword.PreviewProps = {
		resetPasswordUrl: 'http://example.com/reset-password',
		resetCode: '05738611',
	} as ResetPasswordProps
	
	export default ResetPassword
	
	`
}

export default tmpl
