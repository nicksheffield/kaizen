import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, forwardRef, useState } from 'react'

type RevealButtonProps = ButtonProps & {
	onClick?: () => void
	icon: ReactNode
	iconSide?: 'left' | 'right'
	label: string
	revealLabel?: string
}

export const RevealButton = forwardRef<HTMLButtonElement, RevealButtonProps>(
	({ onClick, icon, iconSide = 'left', label, revealLabel, className, ...props }, ref) => {
		const [hovered, setHovered] = useState(false)

		return (
			<Button
				className={cn(
					'rounded-full px-2 hover:highlight-white/10',
					revealLabel && 'bg-primary text-primary-foreground highlight-white/10',
					className
				)}
				onMouseOver={() => setHovered(true)}
				onMouseOut={() => setHovered(false)}
				onClick={onClick}
				{...props}
				ref={ref}
			>
				{iconSide === 'left' && icon}
				<AnimatePresence>
					{(hovered || revealLabel) && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							exit={{ width: 0, opacity: 0 }}
							animate={{ width: 'auto', opacity: 1 }}
							className={cn('flex overflow-hidden rounded-full', iconSide === 'left' && 'justify-end')}
						>
							<div className={cn(iconSide === 'left' ? 'ml-2' : 'mr-2')}>{revealLabel || label}</div>
						</motion.div>
					)}
				</AnimatePresence>
				{iconSide === 'right' && icon}
			</Button>
		)
	}
)

RevealButton.displayName = 'RevealButton'
