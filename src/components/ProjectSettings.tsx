import { Form, FormInputRow, FormInputRowProps, FormSelectRow, FormSwitchRow, useForm } from '@/components/form'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { generatorNames } from '@/generators'
import { useApp } from '@/lib/AppContext'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLocalStorage } from 'usehooks-ts'

export const ProjectSettings = () => {
	const project = useApp((v) => v.project)
	const saveProject = useApp((v) => v.saveProject)

	const form = useForm({
		initialValues: {
			project: project?.project,
			auth: project?.auth,
			env: project?.env,
			settings: project?.settings || { dev: {}, production: {} },
		},
		onSubmit: async (values) => {
			if (!project) return

			const newProj = {
				...project,
				project: {
					...project.project,
					...values.project,
				},
				settings: {
					dev: {
						...project.settings.dev,
						...values.settings.dev,
					},
					production: {
						...project.settings.production,
						...values.settings.production,
					},
				},
				auth: {
					expiresIn: values.auth?.expiresIn ?? '60',
					cookies: values.auth?.cookies ?? true,
					bearer: values.auth?.bearer ?? true,
				},
				env: {
					...project.env,
					...values.env,
				},
			}

			await saveProject(newProj)

			toast('Project settings saved', { closeButton: true })
		},
	})

	const gen = form.values.project?.generator

	const [tab, setTab] = useLocalStorage('project-settings-tab', 'project')

	return (
		<Form context={form} className="flex min-h-0 flex-1 flex-row">
			<div className="flex w-[200px] shrink-0 flex-col border-r p-2">
				<Button
					variant={tab === 'project' ? 'default' : 'ghost'}
					size="pip"
					className="justify-start"
					onClick={() => {
						setTab('project')
					}}
				>
					Project
				</Button>
				{gen === 'hono' && (
					<Button
						variant={tab === 'auth' ? 'default' : 'ghost'}
						size="pip"
						className="justify-start"
						onClick={() => {
							setTab('auth')
						}}
					>
						Auth
					</Button>
				)}
				<Button
					variant={tab === 'dev' ? 'default' : 'ghost'}
					size="pip"
					className="justify-start"
					onClick={() => {
						setTab('dev')
					}}
				>
					Dev Settings
				</Button>
				<Button
					variant={tab === 'prod' ? 'default' : 'ghost'}
					size="pip"
					className="justify-start"
					onClick={() => {
						setTab('prod')
					}}
				>
					Production Settings
				</Button>
				<Button
					variant={tab === 'env' ? 'default' : 'ghost'}
					size="pip"
					className="justify-start"
					onClick={() => {
						setTab('env')
					}}
				>
					Environment
				</Button>
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				<ScrollArea className="flex-1">
					{tab === 'project' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Project</CardTitle>
								<CardDescription>The general settings for the project</CardDescription>
							</div>

							<div className="flex w-full flex-col gap-6 px-4 py-4">
								<FormInputRow name="project.name" label="Name" description="The name of the project." />
								<FormSelectRow
									name="project.generator"
									label="Generator"
									description="The generator to use."
									options={generatorNames.map((x) => ({ label: x, value: x }))}
								/>
								<FormInputRow
									name="project.domainName"
									label="Domain Name"
									description="The domain name where the project is hosted."
								/>
								<FormInputRow
									name="project.maxBodySize"
									label="Max Body Size"
									description="Max upload size limit."
								/>
								<FormInputRow
									name="project.connectionTimeout"
									label="Connection Timeout"
									description="How long to allow connecting to the database before giving up."
								/>
								<FormInputRow
									name="project.devDir"
									label="Dev Build Directory"
									description="Where to put the auto-generated dev build."
								/>
							</div>
						</div>
					)}

					{tab === 'auth' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Auth</CardTitle>
								<CardDescription>Control details about the authentication flow</CardDescription>
							</div>
							<div className="flex w-full flex-col gap-6 px-4 py-4">
								<FormInputRow
									name="auth.expiresIn"
									label="Session Expiry Time (Minutes)"
									description="How long a login session is valid for. If a request is made within the last 50% of the time, the session is extended by this much again."
									type="number"
								/>
								<FormSwitchRow
									name="auth.cookies"
									label="Cookies"
									description="Use HttpOnly cookies for auth."
								/>
								<FormSwitchRow
									name="auth.bearer"
									label="Bearer"
									description="Use Bearer tokens for auth."
								/>
							</div>
						</div>
					)}

					{tab === 'dev' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Dev Settings</CardTitle>
								<CardDescription>Options for the dev environment</CardDescription>
							</div>
							<div className="flex w-full flex-col gap-6 px-4 py-4">
								<FormSwitchRow
									name="settings.dev.useOrbStack"
									label="Use Orb Stack"
									description="Use orb stack instead of docker desktop to enable unique local domains in dev."
								/>
								<FormInputRow
									name="settings.dev.appDir"
									label="App Directory"
									description="The path to the react app projects root directory, where the package.json is located."
								/>
							</div>
						</div>
					)}

					{tab === 'prod' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Production Settings</CardTitle>
								<CardDescription>Options for the production environment</CardDescription>
							</div>
							<div className="flex w-full flex-col gap-6 px-4 py-4"></div>
						</div>
					)}

					{/* {tab === 'format' && (
						<div className="flex w-full flex-col gap-6 px-4 py-4">
							<div className="mb-4 space-y-1.5">
								<CardTitle>Formatting</CardTitle>
								<CardDescription>Set the preferred formatting of the output code</CardDescription>
							</div>
							<FormSwitchRow
								name="formatSettings.prettierTabs"
								label="Tabs"
								description="Indent lines with tabs instead of spaces."
							/>
							<FormSwitchRow
								name="formatSettings.prettierSemicolons"
								label="Semicolons"
								description="Print semicolons at the ends of statements."
							/>
							<FormInputRow
								name="formatSettings.prettierTabWidth"
								label="Tab Width"
								description="Specify the number of spaces per indentation-level."
							/>
							<FormInputRow
								name="formatSettings.prettierPrintWidth"
								label="Print Width"
								description="Specify the line length that the printer will wrap on."
							/>
						</div>
					)} */}

					{tab === 'env' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Environment Variables</CardTitle>
								<CardDescription>Set important environment variables</CardDescription>
							</div>
							<div className="flex w-full flex-col gap-6 px-4 py-4">
								{gen === 'express' && (
									<>
										<TogglePasswordInputRow
											name="env.ACCESS_TOKEN_SECRET"
											label="ACCESS_TOKEN_SECRET"
											description="The secret used to sign JWTs."
										/>
										<TogglePasswordInputRow
											name="env.REFRESH_TOKEN_SECRET"
											label="REFRESH_TOKEN_SECRET"
											description="The secret used to sign JWTs."
										/>
										<TogglePasswordInputRow
											name="env.MARIADB_ROOT_PASSWORD"
											label="MARIADB_ROOT_PASSWORD"
											description="The password of the db's root account."
										/>
										<TogglePasswordInputRow
											name="env.MYSQL_USER"
											label="MYSQL_USER"
											description="The name of the main db user."
										/>
										<TogglePasswordInputRow
											name="env.MYSQL_PASSWORD"
											label="MYSQL_PASSWORD"
											description="The password of the main db user."
										/>
									</>
								)}

								{gen === 'hono' && (
									<>
										<TogglePasswordInputRow
											name="env.MARIADB_ROOT_PASSWORD"
											label="MARIADB_ROOT_PASSWORD"
											description="The password of the db's root account."
										/>
										<TogglePasswordInputRow
											name="env.MYSQL_USER"
											label="MYSQL_USER"
											description="The name of the main db user."
										/>
										<TogglePasswordInputRow
											name="env.MYSQL_PASSWORD"
											label="MYSQL_PASSWORD"
											description="The password of the main db user."
										/>
										<TogglePasswordInputRow
											name="env.EMAIL_HOST"
											label="EMAIL_HOST"
											description="The url of the email server."
										/>
										<TogglePasswordInputRow
											name="env.EMAIL_PORT"
											label="EMAIL_PORT"
											description="The port of the email server."
										/>
										<TogglePasswordInputRow
											name="env.EMAIL_USER"
											label="EMAIL_USER"
											description="The username for connecting to the email server."
										/>
										<TogglePasswordInputRow
											name="env.EMAIL_PASS"
											label="EMAIL_PASS"
											description="The password that goes with the username."
										/>
										<TogglePasswordInputRow
											name="env.EMAIL_FROM"
											label="EMAIL_FROM"
											description="The address to use as the 'from' field of an email."
										/>
									</>
								)}
							</div>
						</div>
					)}
				</ScrollArea>
				<div className="-mt-px flex justify-end border-t bg-muted/50 p-4">
					<Button type="submit">Save</Button>
				</div>
			</div>
		</Form>
	)
}

const TogglePasswordInputRow = (props: FormInputRowProps) => {
	const [show, setShow] = useState(false)

	return (
		<div className="relative">
			<FormInputRow {...props} type={show ? 'text' : 'password'} inputClassName="pr-10" />
			<div className="absolute bottom-0 right-0 mb-2 flex flex-col items-center pr-3">
				{show ? (
					<EyeOffIcon
						className="w-4 cursor-pointer hover:opacity-80"
						onClick={() => setShow((prev) => !prev)}
					/>
				) : (
					<EyeIcon className="w-4 cursor-pointer hover:opacity-80" onClick={() => setShow((prev) => !prev)} />
				)}
			</div>
		</div>
	)
}
