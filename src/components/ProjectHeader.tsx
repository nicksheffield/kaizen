import { openConfirm } from '@/components/Alert'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { RefreshCcwDotIcon } from 'lucide-react'
import { toast } from 'sonner'

export const ProjectHeader = () => {
	const project = useApp((v) => v.project)
	const generateProject = useApp((v) => v.generateProject)
	const root = useApp((v) => v.root)
	const clearRootHandle = useApp((v) => v.clearRootHandle)

	if (!project || !root) return null

	return (
		<div className="pointer-events-auto flex h-10 w-[600px] items-center justify-between rounded-full border bg-muted/50 p-1.5">
			<div className="text-sm font-medium">
				<Button
					variant="pip"
					className="gap-1 rounded-full text-sm font-normal hover:bg-foreground/5"
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
					<span className="text-sm">{project.project.name}</span>
				</Button>
			</div>

			<Button
				variant="default"
				size="pip-icon"
				className="rounded-full"
				onClick={async () => {
					await generateProject(project)
					toast.success('Project generated')
				}}
			>
				<RefreshCcwDotIcon className="h-4 w-4" />
			</Button>
		</div>
	)
}
