import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
	BoltIcon,
	DatabaseIcon,
	DraftingCompassIcon,
	FingerprintIcon,
	FolderCodeIcon,
	TelescopeIcon,
	TentTreeIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const linkStyle = cn(
	buttonVariants({ variant: 'ghost' }),
	'flex cursor-pointer items-center gap-2 rounded-none justify-center w-16 h-16 text-sm',
	'text-muted-foreground hover:bg-foreground/5',
	'aria-[current=page]:bg-primary/20 aria-[current=page]:text-primary aria-[current=page]:hover:bg-primary/30 aria-[current=page]:hover:text-primary'
)

export const Sidebar = () => {
	return (
		<div className="flex flex-col divide-y bg-muted">
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/" className={linkStyle} end>
							<DatabaseIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Models
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/details" className={linkStyle} end>
							<BoltIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Details
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/auth" className={linkStyle} end>
							<FingerprintIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Auth
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/environment" className={linkStyle} end>
							<TentTreeIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Environment
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/helpers" className={linkStyle} end>
							<DraftingCompassIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Helpers
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/sandbox" className={linkStyle} end>
							<TelescopeIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Sandbox
				</TooltipContent>
			</Tooltip>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<div>
						<NavLink to="/files" className={linkStyle} end>
							<FolderCodeIcon className="h-6 w-6" />
						</NavLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" align="center">
					Files
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
