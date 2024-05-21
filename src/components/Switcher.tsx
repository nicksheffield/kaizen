import { FormSwitch } from '@/components/FormFields'
import { labelVariants } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Switcher = ({
	name,
	label,
	description,
	disabled,
	className,
}: {
	name: string
	label: string
	description: string
	disabled?: boolean
	className?: string
}) => {
	return (
		<label
			className={cn(
				'flex cursor-pointer flex-row items-center gap-20 p-4 hover:bg-muted',
				disabled && 'cursor-default opacity-50',
				className
			)}
		>
			<div className="flex flex-1 flex-col gap-0">
				<div className={cn(labelVariants(), 'leading-normal')}>{label}</div>
				<div className="text-sm text-muted-foreground">{description}</div>
			</div>
			<div className="flex items-center gap-2">
				<FormSwitch name={name} disabled={disabled} />
			</div>
		</label>
	)
}
