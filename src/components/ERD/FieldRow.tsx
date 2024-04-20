import { type DetailedHTMLProps, type HTMLAttributes, type ElementType, forwardRef } from 'react'
import { Button } from '@/components/ui/button'

type FieldRowProps = DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	title: string
	type: string
	icon?: ElementType
	placeholder?: string
}

export const FieldRow = forwardRef<HTMLButtonElement, FieldRowProps>(
	({ title, type, icon, placeholder, ...props }, ref) => {
		const Icon = icon

		return (
			<Button
				variant="ghost"
				size="xs"
				className="flex h-[24px] items-center justify-between gap-3 py-0"
				{...props}
				ref={ref}
			>
				<div className="flex items-center gap-2">
					{Icon && <Icon className="-ml-1 h-4 w-4 opacity-25" />}
					{title ? (
						<div className="font-mono text-xs">{title}</div>
					) : (
						<div className="font-mono text-xs italic opacity-50">{placeholder}</div>
					)}
				</div>
				<div className="font-mono text-xs opacity-50">{type}</div>
			</Button>
		)
	}
)
FieldRow.displayName = 'FieldRow'
