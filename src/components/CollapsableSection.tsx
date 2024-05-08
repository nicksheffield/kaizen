import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PropsWithChildren, ReactNode } from 'react'
import { useLocalStorage } from 'usehooks-ts'

type CollapsableSectionProps = {
	title: string
	localStorageKey: string
	button?: ReactNode
}

export const CollapsableSection = ({
	localStorageKey,
	title,
	button,
	children,
}: PropsWithChildren<CollapsableSectionProps>) => {
	const [open, setOpen] = useLocalStorage(localStorageKey, true)

	return (
		<div className="flex flex-col">
			<div className="flex flex-row justify-between gap-2">
				<Button
					variant="ghost"
					size="pip"
					className="flex flex-1 items-center justify-start gap-2 px-2 text-sm font-medium opacity-50 hover:bg-foreground/10"
					onClick={() => {
						setOpen((x) => !x)
					}}
				>
					<ChevronDown className={cn('w-4 -rotate-90 transition-transform', open && 'rotate-0')} />
					{title}
				</Button>
				{button}
			</div>

			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{ height: 0 }}
						exit={{ height: 0 }}
						animate={{ height: 'auto' }}
						className="overflow-hidden"
					>
						<div className="pt-2">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
