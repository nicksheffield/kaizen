import { AlertOctagonIcon, FolderSearchIcon, Loader2Icon } from 'lucide-react'
import { Tree } from './Tree'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import { AddFileMenu } from '@/components/AddFileMenu'
import { ScrollArea } from '@/components/ui/scroll-area'
import pluralize from 'pluralize'
import { PipTabs } from '@/components/PipTabs'
import { useLocalStorage } from 'usehooks-ts'
import { ProjectTree } from '@/components/ProjectTree'

export const Sidebar = () => {
	const files = useApp((v) => v.files)
	const root = useApp((v) => v.root)
	const getRootHandle = useApp((v) => v.getRootHandle)
	const loading = useApp((v) => v.loading)
	const buildErrorPaths = useApp((v) => v.buildErrorPaths)
	const selectedPath = useApp((v) => v.selectedPath)
	const setSelectedPath = useApp((v) => v.setSelectedPath)
	const setOpenPaths = useApp((v) => v.setOpenPaths)

	const firstLevelDescs = files.filter((x) => x.path !== root?.path).filter((x) => !x.path.includes('/'))

	const [tab, setTab] = useLocalStorage('sidebar-tab', 'project')

	return (
		<div className="relative flex min-h-0 flex-1 flex-col divide-y bg-muted/50">
			{!root ? (
				<div className="flex flex-col p-4">
					<Button onClick={getRootHandle} variant="default">
						{loading ? (
							<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<FolderSearchIcon className="mr-2 h-4 w-4" />
						)}
						Open Project
					</Button>
				</div>
			) : (
				<>
					<div className="flex min-h-0 flex-1 flex-col divide-y">
						<div className="flex h-10 shrink-0 flex-row items-center justify-between px-2">
							<div className="flex flex-row items-center gap-1">
								<PipTabs
									value={tab}
									onValueChange={setTab}
									items={{
										project: 'Config',
										files: 'Files',
									}}
								/>
							</div>

							{tab === 'files' && (
								<div className="flex items-center gap-2">
									<AddFileMenu />
								</div>
							)}
						</div>

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

						{tab === 'files' && (
							<ScrollArea className="flex flex-1 flex-col overflow-auto" orientation="vertical">
								<div className="flex flex-1 flex-col p-2">
									{firstLevelDescs.map((desc) => (
										<Tree key={desc.path} path={desc.path} />
									))}
								</div>
							</ScrollArea>
						)}

						{tab === 'project' && (
							<ScrollArea className="flex flex-1 flex-col overflow-auto" orientation="vertical">
								<ProjectTree />
							</ScrollArea>
						)}
					</div>
				</>
			)}
		</div>
	)
}
