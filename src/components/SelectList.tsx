import { ReactNode, useState } from 'react'
import { Falsish, isNotFalsish } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelectProps } from '@radix-ui/react-select'
import { Button } from '@/components/ui/button'

type Option = {
	label: ReactNode
	value: string
	disabled?: boolean
}

export type SelectListProps = SelectProps & {
	options?: (Option | Falsish)[]
	placeholder?: string
	clearable?: boolean
	className?: string
}

export const SelectList = ({
	options = [],
	placeholder,
	clearable = true,
	className,
	value,
	onValueChange,
	...props
}: SelectListProps) => {
	const [key, setKey] = useState(+new Date())

	return (
		<Select key={key} value={value} onValueChange={onValueChange} {...props}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent position="item-aligned">
				{options.filter(isNotFalsish).map((option) => (
					<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</SelectItem>
				))}
				{clearable && (
					<>
						<SelectSeparator />
						<Button
							className="w-full px-2"
							variant="secondary"
							size="sm"
							onClick={(e) => {
								e.stopPropagation()
								onValueChange?.('')
								setKey(+new Date())
							}}
						>
							Clear
						</Button>
					</>
				)}
			</SelectContent>
		</Select>
	)
}
