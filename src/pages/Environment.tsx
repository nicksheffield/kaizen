import { Hint } from '@/components/Hint'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/lib/AppContext'
import { SERVER_PATH, envHints, envKeys } from '@/lib/constants'
import { isFile } from '@/lib/handle'
import { cn, isNotNone } from '@/lib/utils'
import { TentTreeIcon, XIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

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
		const value = key === 'DB_URI' && project ? generateDBURI(project.settings) : ''
		updateEnv([...envData, { key, value }])
	}

	const removeEnvRow = (key: string) => {
		updateEnv(envData.filter((x) => x.key !== key))
	}

	const updateEnvRow = (key: string, value: string) => {
		updateEnv(envData.map((x) => (x.key === key ? { key, value } : x)))
	}

	return (
		<div className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center p-6">
					<Card className="w-full max-w-3xl border-0 shadow-none">
						<CardHeader className="mb-6">
							<CardTitle className="flex items-center gap-2">
								<TentTreeIcon className="h-6 w-6" />
								Environment Variables
							</CardTitle>
							<CardDescription>
								Set environment variables that will be used locally in dev.
								<br />
								This is all ignored by version control, and you need to set these yourself on the server
								where you deploy.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex w-full flex-col gap-6">
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
						</CardContent>
					</Card>
				</div>
			</ScrollArea>
		</div>
	)
}
