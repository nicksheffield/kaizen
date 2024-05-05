import { TreeFileIcon } from '@/components/TreeFileIcon'
import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { KAIZEN_PATH } from '@/lib/constants'
import { isFile } from '@/lib/handle'
import { camelize, cn, uc } from '@/lib/utils'
import emailTemplate from '@/templates/email-template'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, PlusIcon } from 'lucide-react'
import { useLocalStorage } from 'usehooks-ts'

export const ProjectTree = () => {
	const project = useApp((v) => v.project)
	const files = useApp((v) => v.files)
	const saveFile = useApp((v) => v.saveFile)
	const openFile = useApp((v) => v.openFile)
	const selectedPath = useApp((v) => v.selectedPath)

	const seedFilePath = `${KAIZEN_PATH}/src/seed.ts`

	// const [apiOpen, setApiOpen] = useLocalStorage('sidebar-api-open', true)
	const [emailsOpen, setEmailsOpen] = useLocalStorage('sidebar-emails-open', true)

	const emailFiles = files.filter(isFile).filter((x) => x.path.startsWith('apps/kaizen/emails'))

	if (!project) return null

	return (
		<div className="flex flex-col gap-4 p-2">
			<div className="flex flex-col gap-2">
				<div
					className={cn(
						'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
						selectedPath === 'project.json'
							? 'bg-primary text-primary-foreground hover:bg-primary/80'
							: 'hover:bg-foreground/10'
					)}
					onClick={() => {
						openFile('project.json')
					}}
				>
					<TreeFileIcon path={'project.json'} className="opacity-50" />
					Project
				</div>

				<div
					className={cn(
						'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
						selectedPath === seedFilePath
							? 'bg-primary text-primary-foreground hover:bg-primary/80'
							: 'hover:bg-foreground/10'
					)}
					onClick={() => {
						openFile(seedFilePath)
					}}
				>
					<TreeFileIcon path={seedFilePath} className="opacity-50" />
					Seed
				</div>
			</div>

			{/* <div className="flex flex-col">
				<div className="flex flex-row items-center">
					<Button
						variant="ghost"
						size="pip"
						className="flex flex-1 items-center justify-start gap-2 px-2 text-sm font-medium opacity-50"
						onClick={() => {
							setApiOpen((x) => !x)
						}}
					>
						<ChevronDown className={cn('w-4 -rotate-90 transition-transform', apiOpen && 'rotate-0')} />
						API Endpoints
					</Button>
					<Button
						variant="ghost"
						size="pip-icon"
						onClick={() => {
							openPrompt({
								title: 'Endpoint path',
								onSubmit: async (val) => {
									let path = val

									if (val.startsWith('/')) path = path.slice(1)
									if (val.startsWith('api/')) path = path.slice(4)

									await saveFile(`kaizen/api/${path}.json`, '{}')
									openFile(`kaizen/api/${path}.json`)
								},
							})
						}}
					>
						<PlusIcon className="w-4" />
					</Button>
				</div>

				<AnimatePresence initial={false}>
					{apiOpen && (
						<motion.div
							initial={{ height: 0 }}
							exit={{ height: 0 }}
							animate={{ height: 'auto' }}
							className="overflow-hidden"
						>
							{files
								.filter(isFile)
								.filter((x) => x.path.startsWith('kaizen/api'))
								.map((file) => (
									<div
										key={file.path}
										className={cn(
											'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
											selectedPath === file.path
												? 'bg-primary text-primary-foreground hover:bg-primary/80'
												: 'hover:bg-foreground/10'
										)}
										onClick={() => {
											openFile(file.path)
										}}
									>
										<TreeFileIcon path={file.path} className="opacity-50" />
										{file.path.replace('kaizen/api/', '')}
									</div>
								))}
						</motion.div>
					)}
				</AnimatePresence>
			</div> */}

			<div className="flex flex-col">
				<div className="flex flex-row justify-between">
					<Button
						variant="ghost"
						size="pip"
						className="flex flex-1 items-center justify-start gap-2 px-2 text-sm font-medium opacity-50"
						onClick={() => {
							setEmailsOpen((x) => !x)
						}}
					>
						<ChevronDown className={cn('w-4 -rotate-90 transition-transform', emailsOpen && 'rotate-0')} />
						Emails
					</Button>
					<Button
						variant="ghost"
						size="pip-icon"
						onClick={() => {
							openPrompt({
								title: 'Email name',
								description: 'No spaces, PascalCase, no special characters',
								placeholder: 'eg, ConfirmAccount',
								onSubmit: async (name) => {
									const fixedName = uc(camelize(name))
									await saveFile(
										`kaizen/emails/${fixedName}.tsx`,
										emailTemplate({ name: fixedName, project })
									)
									openFile(`kaizen/emails/${fixedName}.tsx`)
								},
							})
						}}
					>
						<PlusIcon className="w-4" />
					</Button>
				</div>

				<AnimatePresence initial={false}>
					{emailsOpen && (
						<motion.div
							initial={{ height: 0 }}
							exit={{ height: 0 }}
							animate={{ height: 'auto' }}
							className="overflow-hidden"
						>
							{emailFiles.map((file) => (
								<div
									key={file.path}
									className={cn(
										'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
										selectedPath === file.path
											? 'bg-primary text-primary-foreground hover:bg-primary/80'
											: 'hover:bg-foreground/10'
									)}
									onClick={() => {
										openFile(file.path)
									}}
								>
									<TreeFileIcon path={file.path} className="opacity-50" />
									{file.name}
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
