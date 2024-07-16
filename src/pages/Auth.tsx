import { FormInput, FormRow } from '@/components/FormFields'
import { FormSwitcher } from '@/components/Switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { Project } from '@/lib/projectSchemas'
import { FingerprintIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormState = Project['settings']['auth']

export const Auth = () => {
	const project = useApp((v) => v.project)
	const saveProject = useApp((v) => v.saveProject)

	const form = useForm<FormState>({
		defaultValues: project?.settings.auth || {
			requireAccountConfirmation: false,
			require2fa: false,
			sessionExpiry: '60',
			enableCookies: false,
			enableBearer: true,
			enableApiKeys: false,
			enableAuthenticator2fa: true,
			enableEmail2fa: false,
			enableMagicLink: false,
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

		if (values.enableMagicLink !== project.settings.auth.enableMagicLink) {
			const authIndex = newProject.models.findIndex((x) => x.id === newProject.settings.userModelId)

			newProject.models[authIndex].attributes = newProject.models[authIndex].attributes.map((x) =>
				x.name === 'password' ? { ...x, nullable: values.enableMagicLink } : x
			)
		}

		await saveProject(newProject)

		toast('Auth settings saved', { closeButton: true })
	}

	return (
		<Form context={form} onSubmit={onSubmit} disableWhileSubmitting className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center p-6">
					<Card className="w-full max-w-3xl border-0 shadow-none">
						<CardHeader className="mb-6">
							<CardTitle className="flex items-center gap-2">
								<FingerprintIcon className="h-6 w-6" />
								Auth
							</CardTitle>
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

								<div className="-mb-4 font-medium">Tokens</div>
								<Card className="divide-y divide-input overflow-hidden border">
									<FormSwitcher
										name="enableCookies"
										label="Enable Cookies"
										description="Use HttpOnly cookies for auth."
									/>

									<FormSwitcher
										name="enableBearer"
										label="Enable Bearer Tokens"
										description="Use Bearer tokens for auth."
									/>

									<FormSwitcher
										name="enableApiKeys"
										label="Enable Api Keys"
										description="Use API Keys for auth."
									/>

									<FormSwitcher
										name="enableImpersonation"
										label="Enable Impersonation"
										description="Users with the 'impersonator' role can use the `/auth/impersonate` endpoint to impersonate users."
									/>
								</Card>

								<div className="-mb-4 font-medium">Authentication</div>
								<Card className="divide-y divide-input overflow-hidden border">
									<FormSwitcher
										name="enableMagicLink"
										label="Enable Magic Links"
										description="Magic links allow users to login without a password."
									/>

									<FormSwitcher
										name="enableAuthenticator2fa"
										label="Enable Authenticator 2fa"
										description="Enable 2fa using an authenticator app."
									/>

									<FormSwitcher
										name="enableEmail2fa"
										label="Enable Email 2fa"
										description="Enable 2fa using a code sent via email."
									/>

									<FormSwitcher
										name="require2fa"
										label="Require 2fa"
										description="Force users to set up 2fa."
										disabled
									/>
								</Card>

								<div className="-mb-4 font-medium">User Management</div>
								<Card className="divide-y divide-input overflow-hidden border">
									<FormSwitcher
										name="enableRegistration"
										label="Enable Registration"
										description="Allow users to register new accounts themselves."
									/>

									<FormSwitcher
										name="requireAccountConfirmation"
										label="Require Account Confirmation"
										description="Force users to confirm their email address before they can login."
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
