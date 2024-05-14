import { FormInput, FormRow } from '@/components/FormFields'
import { Switcher } from '@/components/Switcher'
import { TreeFileIcon } from '@/components/TreeFileIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { Project } from '@/lib/projectSchemas'
import { generateId } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormState = Project['settings']

export const ProjectDetails = () => {
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
			await generateWorkspace(newProject, true)
		}

		await saveProject(newProject)

		toast('Project settings saved', { closeButton: true })
	}

	return (
		<Form context={form} onSubmit={onSubmit} disableWhileSubmitting className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center p-6">
					<Card className="w-full max-w-3xl border-0 shadow-none">
						<CardHeader className="mb-6">
							<CardTitle className="flex items-center gap-2">
								<TreeFileIcon path="project.json?details" className="h-6 w-6" />
								Details
							</CardTitle>
							<CardDescription>The general settings for the project</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex w-full flex-col gap-6">
								<FormRow label="Name" description="The name of the project. Not used for much">
									<FormInput name="name" />
								</FormRow>

								{/* <FormSelectRow
									name="generator"
									label="Generator"
									description="The generator to use."
									options={generatorNames.map((x) => ({ label: x, value: x }))}
								/> */}

								<div className="-mb-4 font-medium">Monorepo</div>
								<Card className="divide-y overflow-hidden">
									<Switcher
										name="hasClient"
										label="Have Client"
										description="Set this to true if you have a vite based app in the 'apps/client' directory"
									/>
								</Card>

								<div className="-mb-4 font-medium">Dev</div>
								<Card className="divide-y overflow-hidden">
									<Switcher
										name="useOrbStack"
										label="Use Orb Stack"
										description="Use orb stack instead of docker desktop to enable unique local domains in dev."
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
