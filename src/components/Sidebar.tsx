import { AlertOctagonIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import pluralize from 'pluralize'
import { ProjectTree } from '@/components/ProjectTree'
import { cn } from '@/lib/utils'
import { SmallTree } from '@/components/SmallTree'
import { useLocalStorage } from 'usehooks-ts'

export const Sidebar = () => {
	const files = useApp((v) => v.files)
	const buildErrorPaths = useApp((v) => v.buildErrorPaths)
	const selectedPath = useApp((v) => v.selectedPath)
	const setSelectedPath = useApp((v) => v.setSelectedPath)
	const setOpenPaths = useApp((v) => v.setOpenPaths)

	const projectJson = files.find((x) => x.path === 'project.json')

	const [compact, setCompact] = useLocalStorage('compact-mode', false)

	if (!projectJson) return null

	return (
		<div className={cn('flex w-[300px] shrink-0 flex-col', compact && 'w-auto')}>
			<div className="relative flex min-h-0 flex-1 flex-col divide-y bg-muted/50">
				{compact ? (
					<SmallTree />
				) : (
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

						<ScrollArea className="flex flex-1 flex-col overflow-auto" orientation="vertical">
							<ProjectTree />
						</ScrollArea>
					</div>
				)}
			</div>

			<Button
				variant="ghost"
				className="rounded-none"
				onClick={() => {
					setCompact((x) => !x)
				}}
			>
				{compact ? <ChevronsRightIcon className="h-6 w-6" /> : <ChevronsLeftIcon className="h-4 w-4" />}
			</Button>
		</div>
	)
}
