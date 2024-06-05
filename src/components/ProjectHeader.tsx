import { openConfirm } from '@/components/Alert'
import { RevealButton } from '@/components/RevealButton'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { PackageOpenIcon, RefreshCcwDotIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

export const ProjectHeader = () => {
	const project = useApp((v) => v.project)
	const generateProject = useApp((v) => v.generateProject)
	const workspaceIsMissingFiles = useApp((v) => v.workspaceIsMissingFiles)
	const generateWorkspace = useApp((v) => v.generateWorkspace)
	const root = useApp((v) => v.root)
	const clearRootHandle = useApp((v) => v.clearRootHandle)

	if (!root) return null

	return (
		<div className="flex h-10 w-full max-w-[600px] items-center justify-between rounded-full bg-slate-400/20 p-1.5 dark:highlight-white/5">
			<div className="text-sm font-medium">
				<Button
					variant="ghost"
					className="group gap-1 rounded-full text-sm font-normal hover:bg-primary hover:text-primary-foreground hover:highlight-white/10"
					size="pip"
					onClick={() => {
						openConfirm({
							title: 'Close this project?',
							variant: 'destructive',
							onSubmit: () => {
								clearRootHandle()
							},
						})
					}}
				>
					<span className="text-sm">{project?.settings.name || root.name}</span>
					<div className="flex w-0 justify-end opacity-0 transition-all group-hover:w-4 group-hover:opacity-100">
						<XIcon className="h-4 w-4 shrink-0" />
					</div>
				</Button>
			</div>

			{project && (
				<div className="flex flex-row gap-2">
					{workspaceIsMissingFiles && (
						<Button
							variant="ghost"
							size="pip-icon"
							className="rounded-full hover:bg-primary hover:text-primary-foreground hover:highlight-white/10"
							onClick={async () => {
								await generateWorkspace({ projectObj: project })
								toast.success('Workspace generated', { closeButton: true })
							}}
						>
							<PackageOpenIcon className="h-4 w-4" />
						</Button>
					)}

					<RevealButton
						variant="ghost"
						size="pip"
						className="rounded-full hover:bg-primary hover:text-primary-foreground hover:highlight-white/10"
						onClick={async () => {
							await generateProject(project)
							toast.success('Project generated', { closeButton: true })
						}}
						icon={<RefreshCcwDotIcon className="h-4 w-4" />}
						label={'Regenerate'}
						iconSide="right"
					/>

					{/* <Button
						variant="ghost"
						size="pip-icon"
						className="rounded-full hover:bg-primary hover:text-primary-foreground hover:highlight-white/10"
						onClick={async () => {
							await generateProject(project)
							toast.success('Project generated', { closeButton: true })
						}}
					>
						<RefreshCcwDotIcon className="h-4 w-4" />
					</Button> */}
				</div>
			)}
		</div>
	)
}
