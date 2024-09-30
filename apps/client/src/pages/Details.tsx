import { FormInput, FormRow } from '@/components/FormFields'
import { FormSwitcher } from '@/components/Switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { generateId } from '@/lib/utils'
import { Project } from 'common/src'
import { LibraryIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormState = Project['settings']

export const Details = () => {
	const project = useApp((v) => v.project)
	const saveProject = useApp((v) => v.saveProject)
	const generateWorkspace = useApp((v) => v.generateWorkspace)

	const form = useForm<FormState>({
		defaultValues: project?.settings || {
			id: generateId(),
			name: 'New project',
			generator: 'hono',
			useOrbStack: false,
			hasClient: false,
		},
	})

	const onSubmit = async (values: FormState) => {
		if (!project) return

		const clientChange = project.settings.hasClient !== values.hasClient

		const newProject = {
			...project,
			settings: {
				...values,
				auth: {
					...project.settings.auth,
				},
			},
		}

		if (clientChange) {
			await generateWorkspace({ projectObj: newProject, clientChange: true })
		}

		await saveProject(newProject)

		toast('Project settings saved', { closeButton: true })
	}

	return (
		<Form context={form} onSubmit={onSubmit} disableWhileSubmitting className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center gap-6 p-6">
					<div className="flex w-full max-w-5xl items-center justify-between border-0 border-b shadow-none">
						<div className="flex flex-col gap-2 py-6">
							<CardTitle className="flex items-center gap-2">
								<LibraryIcon className="h-6 w-6" />
								Details
							</CardTitle>
							<CardDescription>The general settings for the project</CardDescription>
						</div>

						<Button type="submit">
							Save
							{form.formState.isSubmitting && <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />}
						</Button>
					</div>

					<div className="grid w-full max-w-5xl grid-cols-[1fr,2fr] gap-6">
						<div className="flex flex-col gap-2">
							<div className="font-medium">Settings</div>
							<div className="text-sm text-muted-foreground">The basic settings for the project</div>
						</div>

						<Card className="flex flex-col gap-6 overflow-hidden border">
							<CardContent className="flex flex-col gap-6 p-6">
								<FormRow label="Name" description="The name of the project. Not used for much">
									<FormInput name="name" />
								</FormRow>
							</CardContent>
						</Card>

						<div className="flex flex-col gap-2">
							<div className="font-medium">Monorepo</div>
							<div className="text-sm text-muted-foreground">The monorepo settings for the project</div>
						</div>

						<Card className="divide-y divide-input overflow-hidden border">
							<FormSwitcher
								name="hasClient"
								label="Have Client"
								description="Set this to true if you have a vite based app in the 'apps/client' directory"
							/>
							<FormSwitcher
								name="useOrbStack"
								label="Use Orb Stack"
								description="Use orb stack instead of docker desktop to enable unique local domains in dev"
							/>
						</Card>
					</div>
				</div>
			</ScrollArea>
		</Form>
	)
}
