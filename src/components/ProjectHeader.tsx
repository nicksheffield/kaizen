import { openConfirm } from '@/components/Alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp } from '@/lib/AppContext'
import { ChevronDownIcon, PackageOpenIcon, RefreshCcwDotIcon, XIcon } from 'lucide-react'
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
		<div className="relative z-10 flex items-center gap-4">
			{workspaceIsMissingFiles && (
				<Button
					variant="ghost"
					size="sm"
					className="flex items-center gap-2 bg-light/10"
					onClick={async () => {
						await generateWorkspace({ projectObj: project })
						toast.success('Workspace generated', { closeButton: true })
					}}
				>
					<PackageOpenIcon className="h-4 w-4" />
					<span className="hidden md:inline">Your workspace is missing files</span>
				</Button>
			)}

			<Button
				variant="ghost"
				size="sm"
				className="flex items-center gap-2 bg-light/10"
				onClick={async () => {
					await generateProject(project)
					toast.success('Project generated', { closeButton: true })
				}}
			>
				<RefreshCcwDotIcon className="h-4 w-4" />
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="bg-light/10">
						{project?.settings.name || root.name}
						<ChevronDownIcon className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="bottom" align="end">
					<DropdownMenuItem
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
						<XIcon className="mr-2 h-4 w-4" />
						<span className="text-sm">Close Project</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
