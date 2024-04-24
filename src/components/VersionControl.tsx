import Textarea from '@/components/Textarea'
import { TreeFileIcon } from '@/components/TreeFileIcon'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { isFile } from '@/lib/handle'
import { ProjectSchema } from '@/lib/projectSchemas'
import { cn, safeParse } from '@/lib/utils'
import { CheckIcon, PlusIcon, Undo2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

const StatusSymbol = ({ status, className }: { status: string; className: string }) => {
	const symbol = statusSymbol[status]

	if (!symbol) return <span className={cn(className)}>?</span>

	return <span className={cn(symbol[0], className)}>{symbol[1]}</span>
}

const statusSymbol: Record<string, [string, string]> = {
	modified: ['text-indigo-500', 'M'],
	ignored: ['text-grey-500', '?'],
	unmodified: ['text-grey-500', '?'],
	'*modified': ['text-indigo-500', 'M'],
	'*deleted': ['text-red-500', 'D'],
	'*added': ['text-orange-500', 'A'],
	absent: ['text-grey-500', '?'],
	deleted: ['text-red-500', 'D'],
	added: ['text-orange-500', 'A'],
	'*unmodified': ['text-grey-500', '?'],
	'*absent': ['text-grey-500', '?'],
	'*undeleted': ['text-grey-500', '?'],
	'*undeletemodified': ['text-grey-500', '?'],
}

export const VersionControl = () => {
	const git = useApp((v) => v.git)
	const files = useApp((v) => v.files)
	const root = useApp((v) => v.root)
	const openPath = useApp((v) => v.openPath)
	const selectedPath = useApp((v) => v.selectedPath)
	const saveFile = useApp((v) => v.saveFile)
	const generateProject = useApp((v) => v.generateProject)

	const [diff, setDiff] = useState<Record<string, string>>({})
	const [commitMsg, setCommitMsg] = useState('')

	const isFileUnimportant = (status: string) => {
		return status === 'unmodified' || status === 'ignored'
	}

	// const createCommit = async () => {
	// 	if (!git) return

	// 	const fileDescs = files.filter(isFile).filter((x) => !x.path.startsWith('.git'))

	// 	const fileStatuses: Record<string, GitFileStatus> = {}

	// 	for (const file of fileDescs) {
	// 		const status = await git.status(file.path)

	// 		if (!status) continue
	// 		fileStatuses[file.path] = status
	// 	}

	// 	setCommitMsg('')
	// }

	useEffect(() => {
		if (!git) return

		const main = async () => {
			const fileDescs = files.filter(isFile).filter((x) => !x.path.startsWith('.git'))

			const diffs: Record<string, string> = {}

			for (const file of fileDescs) {
				const status = await git.status(file.path)

				if (!status) continue
				// if (file.path.startsWith(project.project.devDir)) continue
				diffs[file.path] = status
			}

			setDiff(diffs)
		}

		main()
	}, [files])

	const changes = Object.entries(diff).filter(([, status]) => !isFileUnimportant(status))

	if (!root) return <div></div>

	return (
		<div className="flex min-h-0 min-w-0 flex-1 shrink-0 flex-col divide-y bg-muted/50">
			{/* <div className="px-2 h-10 shrink-0 flex items-center">
				<div className="text-sm font-medium opacity-50">Version Control</div>
			</div> */}
			<div className="flex shrink-0 flex-col gap-2 px-2 py-2">
				<Textarea value={commitMsg} onValueChange={setCommitMsg} placeholder="Commit Message..." />

				<Button
					variant="secondary"
					size="sm"
					onClick={async () => {
						console.log(await git?.thing())
					}}
				>
					<CheckIcon className="mr-2 h-4 w-4" />
					Commit
				</Button>
			</div>

			<ScrollArea className="flex min-w-0 flex-1 flex-col overflow-auto">
				<div className="flex min-w-0 flex-1 flex-col p-2">
					{changes.length > 0 && (
						<>
							<div className="px-3 py-1 text-xs font-medium opacity-50">Changes</div>
							{changes.map(([path, status]) => (
								<div
									key={path}
									className={cn(
										'group relative flex h-7 w-[calc(300px-(4*0.25rem))] min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-foreground/10',
										selectedPath === `diff:${path}` &&
											'bg-primary text-primary-foreground hover:bg-primary/90'
									)}
									onClick={() => {
										openPath(`diff:${path}`)
									}}
								>
									<TreeFileIcon path={path} />

									<div className="flex-1 truncate align-baseline">
										<span className="text-sm">{path.split('/').pop()} </span>
										<span className="text-xs opacity-50">
											{path.split('/').slice(0, -1).join('/')}
										</span>
									</div>

									<div className="pointer-events-none hidden flex-row opacity-0 group-hover:pointer-events-auto group-hover:flex group-hover:opacity-100">
										<Button
											variant="secondary"
											size="pip-icon"
											className={cn(
												'h-5 w-5 bg-transparent hover:bg-foreground/10',
												selectedPath === `diff:${path}` && 'text-light'
											)}
											onClick={async () => {
												if (!git) return
												const content = await git.getFileHead(path)

												saveFile(path, content)

												if (path === 'project.json') {
													generateProject(ProjectSchema.parse(safeParse(content, {})))
												}
											}}
										>
											<Undo2Icon className="h-4 w-4" />
										</Button>
										<Button
											variant="secondary"
											size="pip-icon"
											className={cn(
												'h-5 w-5 bg-transparent hover:bg-foreground/10',
												selectedPath === `diff:${path}` && 'text-light'
											)}
										>
											<PlusIcon className="h-4 w-4" />
										</Button>
									</div>

									<span className="w-4 justify-self-end text-center text-xs text-gray-500">
										<StatusSymbol
											status={status}
											className={cn(selectedPath === `diff:${path}` && 'text-light')}
										/>
									</span>
								</div>
							))}
						</>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
