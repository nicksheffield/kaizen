import { AlertOctagonIcon, FolderSearchIcon, RocketIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import pluralize from 'pluralize'
import { ProjectTree } from '@/components/ProjectTree'

export const Sidebar = () => {
	const files = useApp((v) => v.files)
	const root = useApp((v) => v.root)
	const getRootHandle = useApp((v) => v.getRootHandle)
	const buildErrorPaths = useApp((v) => v.buildErrorPaths)
	const selectedPath = useApp((v) => v.selectedPath)
	const setSelectedPath = useApp((v) => v.setSelectedPath)
	const setOpenPaths = useApp((v) => v.setOpenPaths)
	const generateWorkspace = useApp((v) => v.generateWorkspace)

	const projectJson = files.find((x) => x.path === 'project.json')

	return (
		<div className="relative flex min-h-0 flex-1 flex-col divide-y bg-muted/50">
			{!root ? (
				<div className="flex flex-col p-4">
					<Button onClick={getRootHandle} variant="default">
						<FolderSearchIcon className="mr-2 h-4 w-4" />
						Open Project
					</Button>
				</div>
			) : (
				<>
					<div className="flex min-h-0 flex-1 flex-col divide-y">
						{buildErrorPaths.length > 0 && (
							<div className="p-2">
								<Button
									variant="destructive"
									className="w-full"
									onClick={() => {
										const nextIndex =
											(buildErrorPaths.indexOf(selectedPath || '') + 1) % buildErrorPaths.length
										setOpenPaths((o) =>
											[...o, buildErrorPaths[nextIndex]].filter((x, i, a) => a.indexOf(x) === i)
										)
										setSelectedPath(buildErrorPaths[nextIndex])
									}}
								>
									<AlertOctagonIcon className="mr-2 w-5" />
									There {buildErrorPaths.length === 1 ? 'is' : 'are'} {buildErrorPaths.length}{' '}
									{pluralize('file', buildErrorPaths.length)} with build errors
								</Button>
							</div>
						)}

						{!projectJson && (
							<div className="flex items-center justify-center py-4">
								<Button
									variant="default"
									onClick={() => {
										generateWorkspace()
									}}
								>
									<RocketIcon className="mr-2 h-4 w-4" />
									Initiate workspace
								</Button>
							</div>
						)}

						<ScrollArea className="flex flex-1 flex-col overflow-auto" orientation="vertical">
							<ProjectTree />
						</ScrollArea>
					</div>
				</>
			)}
		</div>
	)
}
