import { openConfirm } from '@/components/Alert'
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
		<div className="flex h-10 w-full max-w-[600px] items-center justify-between rounded-full border bg-muted/50 p-1.5">
			<div className="text-sm font-medium">
				<Button
					variant="pip"
					className="group gap-1 rounded-full text-sm font-normal hover:bg-foreground/5"
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
						<XIcon className="h-4 w-4 shrink-0 text-primary" />
					</div>
				</Button>
			</div>

			{project && (
				<div className="flex flex-row gap-2">
					{workspaceIsMissingFiles && (
						<Button
							variant="pip"
							size="pip-icon"
							className="rounded-full"
							onClick={async () => {
								await generateWorkspace(project)
								toast.success('Workspace generated', { closeButton: true })
							}}
						>
							<PackageOpenIcon className="h-4 w-4" />
						</Button>
					)}

					<Button
						variant="pip"
						size="pip-icon"
						className="rounded-full"
						onClick={async () => {
							await generateProject(project)
							toast.success('Project generated', { closeButton: true })
						}}
					>
						<RefreshCcwDotIcon className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	)
}
