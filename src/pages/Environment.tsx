import { FormRow } from '@/components/FormFields'
import { MonacoEditor } from '@/components/MonacoEditor'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/AppContext'
import { SERVER_PATH } from '@/lib/constants'
import { isFile } from '@/lib/handle'
import { isNotNone } from '@/lib/utils'
import { EarthIcon } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

type EnvData = { key: string; value: string }[]

export const generateDBURI = (settings: { useOrbStack?: boolean; name?: string }) => {
	return `mysql://user:password@${settings.useOrbStack ? `db.${settings.name?.toLowerCase().replace(/\s/g, '-')}.orb.local` : 'localhost'}:3306/db`
}

export const Environment = () => {
	const project = useApp((v) => v.project)

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

	const writeEnv = (data: EnvData) => {
		const d = data.reduce(
			(acc, x) => {
				acc[x.key] = x.value
				return acc
			},
			{} as Record<string, string>
		)

		const {
			DB_URI,
			PORT,
			LOG_REQUESTS,
			SENTRY_API_KEY,
			RESEND_API_KEY,
			RESEND_WEBHOOK_SECRET,
			SENDGRID_API_KEY,
			EMAIL_HOST,
			EMAIL_PORT,
			EMAIL_USER,
			EMAIL_PASS,
			EMAIL_FROM,
			EMAIL_BASEURL,
			DEV_EMAIL_TO,
			S3_BUCKET_NAME,
			S3_BUCKET_ORIGIN,
			S3_BUCKET_REGION,
			S3_ACCESS_KEY_ID,
			S3_SECRET_ACCESS_KEY,
			...rest
		} = d

		const groups = [
			{
				name: 'Server',
				rows: [`PORT=${PORT || ''}`],
			},
			{
				name: 'Database',
				rows: [`DB_URI=${DB_URI || ''}`],
			},
			{
				name: 'Email',
				rows: [
					`RESEND_API_KEY=${RESEND_API_KEY || ''}`,
					`RESEND_WEBHOOK_SECRET=${RESEND_WEBHOOK_SECRET || ''}`,
					`SENDGRID_API_KEY=${SENDGRID_API_KEY || ''}`,
					`EMAIL_FROM=${EMAIL_FROM || ''}`,
					`DEV_EMAIL_TO=${DEV_EMAIL_TO || ''}`,
					`EMAIL_BASEURL=${EMAIL_BASEURL || ''}`,
					`EMAIL_HOST=${EMAIL_HOST || ''}`,
					`EMAIL_PORT=${EMAIL_PORT || ''}`,
					`EMAIL_USER=${EMAIL_USER || ''}`,
					`EMAIL_PASS=${EMAIL_PASS || ''}`,
				],
			},
			{
				name: 'Uploads',
				rows: [
					`S3_BUCKET_NAME=${S3_BUCKET_NAME || ''}`,
					`S3_BUCKET_ORIGIN=${S3_BUCKET_ORIGIN || ''}`,
					`S3_BUCKET_REGION=${S3_BUCKET_REGION || ''}`,
					`S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID || ''}`,
					`S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY || ''}`,
				],
			},
			{
				name: 'Error Reporting',
				rows: [`SENTRY_API_KEY=${SENTRY_API_KEY || ''}`],
			},
			{
				name: 'Debug',
				rows: [`LOG_REQUESTS=${LOG_REQUESTS || 'false'}`],
			},
			{
				name: 'Custom',
				rows: Object.entries(rest)
					.filter((x) => x[1])
					.map((x) => `${x[0]}=${x[1]}`),
			},
		]

		let newContent = groups.reduce((acc, x) => {
			return `${acc}# ${x.name}\n${x.rows.join('\n')}\n\n`
		}, '')

		return newContent
	}

	const saveEnv = (data: EnvData) => {
		saveFile(`${SERVER_PATH}/.env`, writeEnv(data))
	}

	const codeToEnvData = (code: string): EnvData => {
		return code
			.split('\n')
			.map((x) => {
				if (!x.includes('=')) return null
				const [key, value] = x.split('=')
				return { key, value }
			})
			.filter(isNotNone)
	}

	const updateEnvRow = (key: string, value: string) => {
		const newEnvData = envData.map((x) => (x.key === key ? { key, value } : x))
		setEnvData(newEnvData)
		setCode(writeEnv(newEnvData))
	}

	const [code, setCode] = useState(envFile?.content || '')

	const [viewMode, setViewMode] = useLocalStorage(`project-${project?.settings.id}-env-view-mode`, 'form') // form | code

	const [emailTab, setEmailTab] = useState(envData.find((x) => x.key === 'RESEND_API_KEY')?.value ? 'resend' : 'stmp')

	return (
		<div className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center gap-6 p-6">
					<div className="relative flex w-full max-w-5xl items-center justify-between shadow-none">
						<div className="flex flex-col gap-2 py-6">
							<CardTitle className="flex items-center gap-2">
								<EarthIcon className="h-6 w-6" />
								Environment
							</CardTitle>
							<CardDescription>Set up integrations with other services.</CardDescription>
						</div>

						<Button
							variant="default"
							onClick={() => {
								if (viewMode === 'code') {
									saveEnv(codeToEnvData(code))
								} else {
									saveEnv(envData)
									setCode(writeEnv(envData))
								}
							}}
						>
							Save
						</Button>
					</div>

					<div className="-mt-6 flex w-full max-w-5xl flex-col gap-6">
						<Tabs value={viewMode} onValueChange={setViewMode}>
							<TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0 pb-px">
								<TabsTrigger
									value="form"
									className="rounded-none px-4 transition-none hover:text-foreground data-[state=active]:-mb-[2px] data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
								>
									Form
								</TabsTrigger>
								<TabsTrigger
									value="code"
									className="rounded-none px-4 transition-none hover:text-foreground data-[state=active]:-mb-[2px] data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
								>
									Code
								</TabsTrigger>
							</TabsList>
						</Tabs>

						{viewMode === 'form' ? (
							<div className="grid w-full grid-cols-[1fr,2fr] gap-6">
								<div className="flex flex-col gap-2">
									<div className="font-medium">Misc</div>
									<div className="text-sm text-muted-foreground">Miscellaneous settings</div>
								</div>

								<Card className="flex flex-col gap-6 border p-4">
									<EnvRow
										label="Server Port"
										description="The port to run the server on."
										field="PORT"
										value={envData.find((x) => x.key === 'PORT')?.value || ''}
										onChange={(val) => updateEnvRow('PORT', val)}
									/>
								</Card>

								<div className="flex flex-col gap-2">
									<div className="font-medium">Database</div>
									<div className="text-sm text-muted-foreground">Connect to your mysql database</div>
								</div>

								<Card className="flex flex-col gap-6 border p-4">
									<EnvRow
										label="Database URI"
										description="The URI to connect to the database."
										field="DB_URI"
										value={envData.find((x) => x.key === 'DB_URI')?.value || ''}
										onChange={(val) => updateEnvRow('DB_URI', val)}
									/>
								</Card>

								<div className="flex flex-col gap-2">
									<div className="font-medium">Email</div>
									<div className="text-sm text-muted-foreground">
										Send emails via your email provider
									</div>
								</div>

								<Card className="flex flex-col gap-6 border p-4">
									<Tabs value={emailTab} onValueChange={setEmailTab}>
										<TabsList className="grid w-full grid-cols-3">
											<TabsTrigger value="stmp">SMTP</TabsTrigger>
											<TabsTrigger value="resend">Resend</TabsTrigger>
											<TabsTrigger value="sendgrid" disabled>
												Sendgrid
											</TabsTrigger>
										</TabsList>

										<TabsContent
											value="stmp"
											className="mt-0 flex flex-col gap-6 data-[state=active]:mt-6"
										>
											<EnvRow
												label="Email From"
												description="The email address to send emails from."
												field="EMAIL_FROM"
												value={envData.find((x) => x.key === 'EMAIL_FROM')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_FROM', val)}
											/>
											<EnvRow
												label="Dev Email To"
												description="The email address to send emails to in development."
												field="DEV_EMAIL_TO"
												value={envData.find((x) => x.key === 'DEV_EMAIL_TO')?.value || ''}
												onChange={(val) => updateEnvRow('DEV_EMAIL_TO', val)}
											/>
											<EnvRow
												label="Email Base URL"
												description="The base URL to use for links in emails."
												field="EMAIL_BASEURL"
												value={envData.find((x) => x.key === 'EMAIL_BASEURL')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_BASEURL', val)}
											/>
											<EnvRow
												label="Email Host"
												description="The host of the email server."
												field="EMAIL_HOST"
												value={envData.find((x) => x.key === 'EMAIL_HOST')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_HOST', val)}
											/>
											<EnvRow
												label="Email Port"
												description="The port of the email server."
												field="EMAIL_PORT"
												value={envData.find((x) => x.key === 'EMAIL_PORT')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_PORT', val)}
											/>
											<EnvRow
												label="Email User"
												description="The username of the email server."
												field="EMAIL_USER"
												value={envData.find((x) => x.key === 'EMAIL_USER')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_USER', val)}
											/>
											<EnvRow
												label="Email Pass"
												description="The password of the email server."
												field="EMAIL_PASS"
												value={envData.find((x) => x.key === 'EMAIL_PASS')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_PASS', val)}
											/>
										</TabsContent>

										<TabsContent
											value="resend"
											className="mt-0 flex flex-col gap-6 data-[state=active]:mt-6"
										>
											<EnvRow
												label="Email From"
												description="The email address to send emails from."
												field="EMAIL_FROM"
												value={envData.find((x) => x.key === 'EMAIL_FROM')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_FROM', val)}
											/>
											<EnvRow
												label="Dev Email To"
												description="The email address to send emails to in development."
												field="DEV_EMAIL_TO"
												value={envData.find((x) => x.key === 'DEV_EMAIL_TO')?.value || ''}
												onChange={(val) => updateEnvRow('DEV_EMAIL_TO', val)}
											/>
											<EnvRow
												label="Email Base URL"
												description="The base URL to use for links in emails."
												field="EMAIL_BASEURL"
												value={envData.find((x) => x.key === 'EMAIL_BASEURL')?.value || ''}
												onChange={(val) => updateEnvRow('EMAIL_BASEURL', val)}
											/>
											<EnvRow
												label="Resend API Key"
												description="The API key to use for sending emails via resend."
												field="RESEND_API_KEY"
												value={envData.find((x) => x.key === 'RESEND_API_KEY')?.value || ''}
												onChange={(val) => updateEnvRow('RESEND_API_KEY', val)}
											/>
											<EnvRow
												label="Resend Webhook Secret"
												description="The secret used to verify webhook requests from resend."
												field="RESEND_WEBHOOK_SECRET"
												value={
													envData.find((x) => x.key === 'RESEND_WEBHOOK_SECRET')?.value || ''
												}
												onChange={(val) => updateEnvRow('RESEND_WEBHOOK_SECRET', val)}
											/>
										</TabsContent>
									</Tabs>
								</Card>

								<div className="flex flex-col gap-2">
									<div className="font-medium">Uploads</div>
									<div className="text-sm text-muted-foreground">Configure s3 file uploads</div>
								</div>

								<Card className="flex flex-col gap-6 border p-4">
									<EnvRow
										label="S3 Bucket Name"
										description="The name of your S3 bucket."
										field="S3_BUCKET_NAME"
										value={envData.find((x) => x.key === 'S3_BUCKET_NAME')?.value || ''}
										onChange={(val) => updateEnvRow('S3_BUCKET_NAME', val)}
									/>
									<EnvRow
										label="S3 Bucket Origin"
										description="The origin of your S3 bucket (including https://)."
										field="S3_BUCKET_ORIGIN"
										value={envData.find((x) => x.key === 'S3_BUCKET_ORIGIN')?.value || ''}
										onChange={(val) => updateEnvRow('S3_BUCKET_ORIGIN', val)}
									/>
									<EnvRow
										label="S3 Bucket Region"
										description="The geographical region of your S3 bucket."
										field="S3_BUCKET_REGION"
										value={envData.find((x) => x.key === 'S3_BUCKET_REGION')?.value || ''}
										onChange={(val) => updateEnvRow('S3_BUCKET_REGION', val)}
									/>
									<EnvRow
										label="S3 Access Key ID"
										description="The access key ID for your S3 bucket."
										field="S3_ACCESS_KEY_ID"
										value={envData.find((x) => x.key === 'S3_ACCESS_KEY_ID')?.value || ''}
										onChange={(val) => updateEnvRow('S3_ACCESS_KEY_ID', val)}
									/>
									<EnvRow
										label="S3 Secret Access Key"
										description="The secret access key for your S3 bucket."
										field="S3_SECRET_ACCESS_KEY"
										value={envData.find((x) => x.key === 'S3_SECRET_ACCESS_KEY')?.value || ''}
										onChange={(val) => updateEnvRow('S3_SECRET_ACCESS_KEY', val)}
									/>
								</Card>

								<div className="flex flex-col gap-2">
									<div className="font-medium">Error Reporting</div>
									<div className="text-sm text-muted-foreground">
										Connect to your error reporting service
									</div>
								</div>

								<Card className="flex flex-col gap-6 border p-4">
									<EnvRow
										label="Sentry API Key"
										description="The API key to use for sending error reports to Sentry."
										field="SENTRY_API_KEY"
										value={envData.find((x) => x.key === 'SENTRY_API_KEY')?.value || ''}
										onChange={(val) => updateEnvRow('SENTRY_API_KEY', val)}
										disabled
									/>
								</Card>

								<div className="flex flex-col gap-2">
									<div className="font-medium">Debug</div>
									<div className="text-sm text-muted-foreground">Debug settings</div>
								</div>

								<Card className="flex flex-col gap-6 border p-4">
									<EnvRow
										label="Log Requests"
										description="Log all http requests. 'true' or 'false'"
										field="LOG_REQUESTS"
										value={envData.find((x) => x.key === 'LOG_REQUESTS')?.value || ''}
										onChange={(val) => updateEnvRow('LOG_REQUESTS', val)}
									/>
								</Card>
							</div>
						) : (
							<Card className="overflow-hidden rounded-md border py-1">
								<MonacoEditor
									value={code}
									onValueChange={(val) => {
										setCode(val)
										setEnvData(codeToEnvData(val))
									}}
									height="600px"
								/>
							</Card>
						)}
					</div>
				</div>
			</ScrollArea>
		</div>
	)
}

type EnvRowProps = {
	label: string
	description: string
	field: string
	value: string
	onChange: (value: string) => void
	disabled?: boolean
}

const EnvRow = ({ label, description, field, value, onChange, disabled = false }: EnvRowProps) => {
	return (
		<FormRow label={label} description={description}>
			<div className="relative">
				<Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
				<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
					{field}
				</div>
			</div>
		</FormRow>
	)
}
