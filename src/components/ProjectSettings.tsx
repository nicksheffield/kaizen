import { FormInput, FormRow, FormSwitch } from '@/components/FormFields'
import { Hint } from '@/components/Hint'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/lib/AppContext'
import { SERVER_PATH, envHints, envKeys } from '@/lib/constants'
import { isFile } from '@/lib/handle'
import { Project } from '@/lib/projectSchemas'
import { cn, generateId, isNotNone } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebounceCallback, useLocalStorage } from 'usehooks-ts'

type EnvData = { key: string; value: string }[]

type FormState = Project['settings']

const generateDBURI = ({ settings }: Project) => {
	return `mysql://user:password@${settings.useOrbStack ? `db.${settings.name.toLowerCase().replace(/\s/g, '-')}.orb.local` : 'localhost'}:3306/db`
}

export const ProjectSettings = () => {
	const project = useApp((v) => v.project)
	const saveProject = useApp((v) => v.saveProject)

	const form = useForm<FormState>({
		defaultValues: {
			...(project?.settings || {
				id: generateId(),
				name: 'New project',
				generator: 'hono',
				useOrbStack: false,
				hasClient: false,
				auth: {
					requireAccountConfirmation: true,
					require2fa: false,
					sessionExpiry: '60',
					enableCookies: false,
					enableBearer: true,
					enableAuthenticator2fa: true,
					enableEmail2fa: false,
				},
			}),
		},
	})

	const onSubmit = async (values: FormState) => {
		if (!project) return
		if (!values) return

		await saveProject({
			...project,
			settings: {
				...values,
				auth: {
					...project.settings.auth,
					...values.auth,
				},
			},
		})

		toast('Project settings saved', { closeButton: true })
	}

	const files = useApp((v) => v.files)
	const saveFile = useApp((v) => v.saveFile)
	const envFile = files.filter(isFile).find((x) => x.path === `${SERVER_PATH}/.env`)

	const [envData, setEnvData] = useState<EnvData>(
		envFile?.content
			.split('\n')
			.map((x) => {
				if (!x.includes('=')) return null
				const [key, value] = x.split('=')
				return { key, value }
			})
			.filter(isNotNone) || []
	)

	const saveEnv = useDebounceCallback(
		useCallback((data: EnvData) => {
			const newContent = data.map((x) => `${x.key}=${x.value}`).join('\n')
			saveFile(`${SERVER_PATH}/.env`, newContent)
		}, []),
		500
	)

	const updateEnv = (envOptions: EnvData) => {
		setEnvData(envOptions)
		saveEnv(envOptions)
	}

	const addEnvRow = (key: string) => {
		const value = key === 'DB_URI' && project ? generateDBURI(project) : ''
		updateEnv([...envData, { key, value }])
	}

	const removeEnvRow = (key: string) => {
		updateEnv(envData.filter((x) => x.key !== key))
	}

	const updateEnvRow = (key: string, value: string) => {
		updateEnv(envData.map((x) => (x.key === key ? { key, value } : x)))
	}

	const [tab, setTab] = useLocalStorage('project-settings-tab', 'project')

	return (
		<Form context={form} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-row">
			<div className="flex w-[200px] shrink-0 flex-col gap-1 border-r p-2">
				<Button
					variant={tab === 'details' ? 'default' : 'ghost'}
					size="pip"
					className="justify-start"
					onClick={() => {
						setTab('details')
					}}
				>
					Details
				</Button>

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
					{tab === 'details' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Details</CardTitle>
								<CardDescription>The general settings for the project</CardDescription>
							</div>

							<div className="flex w-full flex-col gap-6 px-4 py-4">
								<FormRow label="Name">
									<FormInput name="name" />
								</FormRow>

								{/* <FormSelectRow
									name="generator"
									label="Generator"
									description="The generator to use."
									options={generatorNames.map((x) => ({ label: x, value: x }))}
								/> */}

								<Card className="divide-y">
									<Switcher
										name="useOrbStack"
										label="Use Orb Stack"
										description="Use orb stack instead of docker desktop to enable unique local domains in dev."
									/>

									<Switcher
										name="hasClient"
										label="Have Client"
										description="Set this to true if you have a vite based app in the 'apps/client' directory"
									/>
								</Card>
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
								<FormRow
									label="Session Expiry Time"
									description="How long a login session is valid for in minutes."
								>
									<FormInput name="auth.sessionExpiry" type="number" />
								</FormRow>

								<Card className="divide-y">
									<Switcher
										name="auth.enableCookies"
										label="Enable Cookies"
										description="Use HttpOnly cookies for auth."
									/>

									<Switcher
										name="auth.enableBearer"
										label="Enable Bearer Tokens"
										description="Use Bearer tokens for auth."
									/>

									<Switcher
										name="auth.enableAuthenticator2fa"
										label="Enable Authenticator 2fa"
										description="Enable 2fa using an authenticator app."
									/>

									<Switcher
										name="auth.enableEmail2fa"
										label="Enable Email 2fa"
										description="Enable 2fa using a code sent via email."
									/>

									<Switcher
										name="auth.enableRegistration"
										label="Enable Registration"
										description="Allow users to register new accounts themselves."
										disabled
									/>

									<Switcher
										name="auth.requireAccountConfirmation"
										label="Require Account Confirmation"
										description="Force users to confirm their email address before they can login."
										disabled
									/>

									<Switcher
										name="auth.require2fa"
										label="Require 2fa"
										description="Force users to set up 2fa."
										disabled
									/>
								</Card>
							</div>
						</div>
					)}

					{tab === 'env' && (
						<div className="flex w-full flex-col">
							<div className="space-y-1.5 border-b bg-muted/50 px-4 py-4">
								<CardTitle>Environment Variables</CardTitle>
								<CardDescription>
									Set environment variables that will be used locally in dev.
									<br />
									This is all ignored by version control, and you need to set these yourself on the
									server where you deploy.
								</CardDescription>
							</div>
							<div className="flex w-full flex-col gap-6 px-4 py-4">
								<div className="overflow flex flex-col divide-y rounded-md border font-mono text-sm">
									{envKeys
										.map((x) => envData.find((y) => y.key === x))
										.filter(isNotNone)
										.map((x, i) => (
											<div key={i} className="flex flex-row divide-x">
												<div
													className={cn(
														'relative flex w-[230px] items-center justify-between rounded-none border-0 px-3 py-1.5 focus:z-10',
														i === 0 && 'rounded-tl-md'
													)}
												>
													{x.key}
													<Hint content={envHints[x.key]} />
												</div>
												<Input
													value={x.value}
													onChange={(e) => {
														updateEnvRow(x.key, e.target.value)
													}}
													className={cn(
														'flex-1 rounded-none border-0 px-3 py-1.5 focus:z-10'
													)}
												/>
												<Button
													variant="ghost"
													onClick={() => {
														removeEnvRow(x.key)
													}}
													className={cn('rounded-none border-0', i === 0 && 'rounded-tr-md')}
												>
													<XIcon className="w-4" />
												</Button>
											</div>
										))}
									<div className="flex flex-row divide-x">
										<Select
											value={''}
											onValueChange={(val) => {
												if (!val) return
												addEnvRow(val)
											}}
										>
											<SelectTrigger
												className={cn(
													'relative w-[230px] rounded-none border-0 px-3 py-1.5 focus:z-10',
													envData?.length === 0 && 'rounded-tl-md',
													'rounded-bl-md'
												)}
											>
												<SelectValue placeholder="Select..." />
											</SelectTrigger>
											<SelectContent>
												{envKeys
													.filter((x) => !envData.find((y) => y.key === x))
													.map((x) => (
														<SelectItem key={x} value={x}>
															{x}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
										<div
											className={cn(
												'flex-1 rounded-none border-0 px-3 py-1.5 focus:z-10',
												envData?.length === 0 && 'rounded-tr-md',
												'rounded-br-md'
											)}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</ScrollArea>
				{(tab === 'details' || tab === 'auth') && (
					<div className="flex justify-end border-t bg-muted/50 p-4">
						<Button type="submit">Save</Button>
					</div>
				)}
			</div>
		</Form>
	)
}

const Switcher = ({
	name,
	label,
	description,
	disabled,
	className,
}: {
	name: string
	label: string
	description: string
	disabled?: boolean
	className?: string
}) => {
	return (
		<div className={cn('flex flex-row items-center gap-20 p-4 hover:bg-muted/50', className)}>
			<div className="flex flex-1 flex-col gap-0">
				<Label className="leading-normal">{label}</Label>
				<div className="text-sm text-muted-foreground">{description}</div>
			</div>
			<div className="flex items-center gap-2">
				<FormSwitch name={name} disabled={disabled} />
			</div>
		</div>
	)
}
