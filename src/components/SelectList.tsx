import { ReactNode } from 'react'
import { Falsish, isNotFalsish } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelectProps } from '@radix-ui/react-select'

type Option = {
	label: ReactNode
	value: string
	disabled?: boolean
}

export type SelectListProps = SelectProps & {
	options?: (Option | Falsish)[]
	placeholder?: string
	className?: string
}

export const SelectList = ({ options = [], placeholder, className, ...props }: SelectListProps) => {
	return (
		<Select {...props}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.filter(isNotFalsish).map((option) => (
					<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
