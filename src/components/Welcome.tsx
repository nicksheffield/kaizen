import { generateDBURI } from '@/components/FileViews/ProjectEnv'
import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { SERVER_PATH } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { FolderSearchIcon, RocketIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const Browse = () => {
	const getRootHandle = useApp((v) => v.getRootHandle)

	return (
		<div className="h-full p-8">
			<div className="flex h-full items-center justify-center rounded-3xl border-4 border-dashed">
				<div className="select-none text-sm font-medium text-muted-foreground">
					<div className="flex flex-col p-4">
						<Button onClick={getRootHandle} variant="default">
							<FolderSearchIcon className="mr-2 h-4 w-4" />
							Open Project
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

const Init = () => {
	const generateWorkspace = useApp((v) => v.generateWorkspace)
	const openFile = useApp((v) => v.openFile)
	const saveFile = useApp((v) => v.saveFile)

	const [initiating, setInitiating] = useState(false)

	return (
		<div className="h-full p-8">
			<div className="flex h-full items-center justify-center rounded-3xl border-4 border-dashed">
				<div className="select-none text-sm font-medium text-muted-foreground">
					<div className="flex items-center justify-center py-4">
						<Button
							variant="default"
							onClick={() => {
								openPrompt({
									title: 'Project name?',
									onSubmit: async (name) => {
										setInitiating(true)
										await generateWorkspace({ name })
										await saveFile(
											`${SERVER_PATH}/.env`,
											`DB_URI=${generateDBURI({ useOrbStack: false, name })}`,
											{
												showToast: false,
											}
										)
										toast.success('Workspace initiated')
										openFile('project.json?models')
										setInitiating(false)
									},
								})
							}}
						>
							<RocketIcon className={cn('mr-2 h-4 w-4', initiating && 'animate-spin')} />
							Initiate workspace
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

const NoFile = () => {
	const root = useApp((v) => v.root)

	return (
		<div className="h-full p-8">
			<div className="flex h-full items-center justify-center rounded-3xl border-4 border-dashed">
				<div className="select-none text-sm font-medium text-muted-foreground">
					{root && 'No file selected'}
				</div>
			</div>
		</div>
	)
}

export const Welcome = () => {
	const root = useApp((v) => v.root)
	const project = useApp((v) => v.project)

	if (!root) return <Browse />
	if (!project) return <Init />

	return <NoFile />
}
