import { openConfirm } from '@/components/Alert'
// import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { RefreshCcwDotIcon } from 'lucide-react'

export const Header = () => {
	return (
		<div className="relative flex items-center justify-between overflow-hidden p-4">
			<div className="">
				{/* <Logo /> */}
				<div className="group origin-left cursor-default text-2xl font-black tracking-tight transition-transform hover:scale-125">
					<span className="group-hover:text-indigo-500">K</span>
					<span className="group-hover:text-purple-500">a</span>
					<span className="group-hover:text-red-500">i</span>
					<span className="group-hover:text-orange-500">z</span>
					<span className="group-hover:text-yellow-500">e</span>
					<span className="group-hover:text-green-500">n</span>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<UserMenu />
			</div>
			<div className="pointer-events-none absolute left-0 top-0 flex w-full items-center justify-center p-4">
				<ProjectTools />
			</div>
		</div>
	)
}

const ProjectTools = () => {
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

			<Button variant="default" size="pip-icon" className="rounded-full" onClick={() => generateProject(project)}>
				<RefreshCcwDotIcon className="h-4 w-4" />
			</Button>
		</div>
	)
}
