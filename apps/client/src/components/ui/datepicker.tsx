import { forwardRef } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type DatePickerProps = {
	value?: Date
	onValueChange?: (date: Date | undefined) => void
	className?: string
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(({ value, onValueChange, className }, ref) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn('justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
					ref={ref}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? (
						<span className="truncate">{format(value, 'PPP')}</span>
					) : (
						<span className="truncate">Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar mode="single" selected={value} onSelect={(val) => onValueChange?.(val)} initialFocus />
			</PopoverContent>
		</Popover>
	)
})
