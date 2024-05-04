import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { HelpCircleIcon } from 'lucide-react'
import { PropsWithChildren, ReactNode } from 'react'

type HintProps = {
	content?: ReactNode
	className?: string
}

export const Hint = ({ content, className }: PropsWithChildren<HintProps>) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className={className} type="button">
					<HelpCircleIcon className="h-4 w-4 shrink-0 opacity-30 hover:opacity-50" />
				</TooltipTrigger>
				<TooltipContent>
					<p>{content || ''}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
