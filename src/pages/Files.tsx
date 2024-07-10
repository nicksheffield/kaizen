import { EditorFrame } from '@/components/EditorFrame'
import { ProjectTree } from '@/components/ProjectTree'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { AlertOctagonIcon } from 'lucide-react'
import pluralize from 'pluralize'

export const Files = () => {
	const buildErrorPaths = useApp((v) => v.buildErrorPaths)
	const selectedPath = useApp((v) => v.selectedPath)
	const setSelectedPath = useApp((v) => v.setSelectedPath)
	const setOpenPaths = useApp((v) => v.setOpenPaths)

	return (
		<div className="flex min-h-0 flex-1 flex-col p-6">
			<div className="grid min-h-0 flex-1 grid-cols-[300px,1fr] gap-4">
				<div className="flex flex-1 flex-col rounded-md bg-background">
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

				<EditorFrame key={selectedPath} />
			</div>
		</div>
	)
}
