import { TreeFileIcon } from '@/components/TreeFileIcon'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useApp } from '@/lib/AppContext'
import { cn } from '@/lib/utils'

export const SmallTree = () => {
	const openFile = useApp((v) => v.openFile)
	const selectedPath = useApp((v) => v.selectedPath)

	return (
		<div className="flex flex-col gap-4 p-4">
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<Button
							variant="ghost"
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === 'project.json?models'
									? 'bg-primary text-primary-foreground highlight-white/10 hover:bg-primary/80 hover:text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/10 hover:highlight-white/5'
							)}
							onClick={() => {
								openFile('project.json?models')
							}}
						>
							<TreeFileIcon path={'project.json?models'} className="h-6 w-6" />
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Models
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<Button
							variant="ghost"
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === 'project.json?details'
									? 'bg-primary text-primary-foreground highlight-white/10 hover:bg-primary/80 hover:text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/10 hover:highlight-white/5'
							)}
							onClick={() => {
								openFile('project.json?details')
							}}
						>
							<TreeFileIcon path={'project.json?details'} className="h-6 w-6" />
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Details
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<Button
							variant="ghost"
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === 'project.json?auth'
									? 'bg-primary text-primary-foreground highlight-white/10 hover:bg-primary/80 hover:text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/10 hover:highlight-white/5'
							)}
							onClick={() => {
								openFile('project.json?auth')
							}}
						>
							<TreeFileIcon path={'project.json?auth'} className="h-6 w-6" />
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Auth
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<Button
							variant="ghost"
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === 'project.json?environment'
									? 'bg-primary text-primary-foreground highlight-white/10 hover:bg-primary/80 hover:text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/10 hover:highlight-white/5'
							)}
							onClick={() => {
								openFile('project.json?environment')
							}}
						>
							<TreeFileIcon path={'project.json?environment'} className="h-6 w-6" />
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Environment
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<Button
							variant="ghost"
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === 'project.json?helpers'
									? 'bg-primary text-primary-foreground highlight-white/10 hover:bg-primary/80 hover:text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/10 hover:highlight-white/5'
							)}
							onClick={() => {
								openFile('project.json?helpers')
							}}
						>
							<TreeFileIcon path={'project.json?helpers'} className="h-6 w-6" />
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Helpers
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<Button
							variant="ghost"
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === 'project.json?sandbox'
									? 'bg-primary text-primary-foreground highlight-white/10 hover:bg-primary/80 hover:text-primary-foreground'
									: 'text-muted-foreground hover:bg-foreground/10 hover:highlight-white/5'
							)}
							onClick={() => {
								openFile('project.json?sandbox')
							}}
						>
							<TreeFileIcon path={'project.json?sandbox'} className="h-6 w-6" />
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Sandbox
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
