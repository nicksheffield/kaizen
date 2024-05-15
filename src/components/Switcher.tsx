import { FormSwitch } from '@/components/FormFields'
import { Label } from '@/components/ui/label'
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
		<div className={cn('flex flex-row items-center gap-20 p-4 hover:bg-muted', className)}>
			<div className="flex flex-1 flex-col gap-0">
				<Label className="leading-normal">{label}</Label>
				<div className="text-sm text-muted-foreground">{description}</div>
			</div>
			<div className="flex items-center gap-2">
				<FormSwitch name={name} disabled={disabled} />
			</div>
		</div>
	)
}
