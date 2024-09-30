import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { PropsWithChildren } from 'react'

type AutoShowProps = {
	open: boolean
	initial?: boolean
	className?: string
}

export const AutoShow = ({ open, initial, className, children }: PropsWithChildren<AutoShowProps>) => {
	return (
		<AnimatePresence initial={initial}>
			{open && (
				<motion.div
					className={cn('overflow-hidden', className)}
					initial={{ height: 0 }}
					animate={{ height: 'auto' }}
					exit={{ height: 0 }}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	)
}
