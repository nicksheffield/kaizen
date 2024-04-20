import { Tooltip } from '@/components/Tooltip'
import { Switch, SwitchProps } from '@/components/ui/switch'
import { type PropsWithChildren, type ReactNode } from 'react'

type PanelRowProps = {
	label: ReactNode
	hint?: ReactNode
}

export const PanelRow = ({ label, hint, children }: PropsWithChildren<PanelRowProps>) => {
	return (
		<div className="flex items-center justify-between gap-1">
			<Tooltip content={hint}>
				<div className="flex-1 cursor-default text-sm font-medium">{label}</div>
			</Tooltip>
			<div className="flex w-2/3 items-center justify-end">{children}</div>
		</div>
	)
}

export const SwitchPanelRow = ({ label, hint, children, ...props }: PropsWithChildren<PanelRowProps & SwitchProps>) => {
	return (
		<div className="flex items-center justify-between gap-1">
			<Tooltip content={hint}>
				<div className="flex-1 cursor-default text-sm font-medium">{label}</div>
			</Tooltip>
			<Switch {...props} />
		</div>
	)
}
