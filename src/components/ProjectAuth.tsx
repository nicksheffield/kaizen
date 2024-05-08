import { FormInput, FormRow } from '@/components/FormFields'
import { Switcher } from '@/components/Switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { Project } from '@/lib/projectSchemas'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormState = Project['settings']['auth']

export const ProjectAuth = () => {
	const project = useApp((v) => v.project)
	const saveProject = useApp((v) => v.saveProject)

	const form = useForm<FormState>({
		defaultValues: project?.settings.auth || {
			requireAccountConfirmation: true,
			require2fa: false,
			sessionExpiry: '60',
			enableCookies: false,
			enableBearer: true,
			enableAuthenticator2fa: true,
			enableEmail2fa: false,
		},
	})

	const onSubmit = async (values: FormState) => {
		if (!project) return

		const newProject = {
			...project,
			settings: {
				...project.settings,
				auth: {
					...project.settings.auth,
					...values,
				},
			},
		}

		await saveProject(newProject)

		toast('Auth settings saved', { closeButton: true })
	}

	return (
		<Form context={form} onSubmit={onSubmit} disableWhileSubmitting className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center p-6">
					<Card className="w-full max-w-3xl border-0 shadow-none">
						<CardHeader>
							<CardTitle>Auth</CardTitle>
							<CardDescription>Control details about the authentication flow</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex w-full flex-col gap-6">
								<FormRow
									label="Session Expiry Time"
									description="How long a login session is valid for in minutes."
								>
									<FormInput name="sessionExpiry" type="number" />
								</FormRow>

								<Card className="divide-y">
									<Switcher
										name="enableCookies"
										label="Enable Cookies"
										description="Use HttpOnly cookies for auth."
									/>

									<Switcher
										name="enableBearer"
										label="Enable Bearer Tokens"
										description="Use Bearer tokens for auth."
									/>

									<Switcher
										name="enableAuthenticator2fa"
										label="Enable Authenticator 2fa"
										description="Enable 2fa using an authenticator app."
									/>

									<Switcher
										name="enableEmail2fa"
										label="Enable Email 2fa"
										description="Enable 2fa using a code sent via email."
									/>

									<Switcher
										name="enableRegistration"
										label="Enable Registration"
										description="Allow users to register new accounts themselves."
										disabled
									/>

									<Switcher
										name="requireAccountConfirmation"
										label="Require Account Confirmation"
										description="Force users to confirm their email address before they can login."
										disabled
									/>

									<Switcher
										name="require2fa"
										label="Require 2fa"
										description="Force users to set up 2fa."
										disabled
									/>
								</Card>

								<div>
									<Button type="submit">
										Save
										{form.formState.isSubmitting && (
											<Loader2Icon className="ml-2 h-4 w-4 animate-spin" />
										)}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</ScrollArea>
		</Form>
	)
}
