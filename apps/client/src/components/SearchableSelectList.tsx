import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { forwardRef, useState } from 'react'

type Option = {
	label: string
	value: unknown
	// disabled?: boolean
}

export type SearchableSelectListProps = {
	value: string
	onValueChange: (value: string) => void
	options: Option[]
	placeholder?: string
	className?: string
}

export const SearchableSelectList = forwardRef<HTMLButtonElement, SearchableSelectListProps>(
	({ value, onValueChange, options, placeholder, className }, ref) => {
		const [open, setOpen] = useState(false)

		const selected = options.find((x) => x.value === value)

		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						className={cn(
							'w-full justify-between px-3 py-2 font-normal',
							placeholder || value ? '' : 'justify-end',
							value !== '' ? '' : 'text-muted-foreground',
							className
						)}
						ref={ref}
					>
						{value !== '' ? options.find((x) => x.value === value)?.label : placeholder}
						<ChevronsUpDownIcon className="ml-auto h-3 w-3 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="popover-combobox p-0">
					<Command className="w-full">
						<CommandInput placeholder={placeholder} />
						<CommandEmpty>No Selectable Items Found.</CommandEmpty>
						<CommandGroup className="max-h-96 overflow-y-auto">
							<CommandList>
								{options.map((option, i) => (
									<CommandItem
										key={i}
										value={option.label}
										// disabled={option.disabled}
										// className={cn(option.disabled && 'opacity-50')}
										className="text-foreground"
										onSelect={() => {
											if (typeof option.value === 'string') onValueChange?.(option.value)
											setOpen(false)
										}}
									>
										<CheckIcon
											className={cn(
												'mr-2 h-4 w-4',
												selected?.label === option.label ? 'opacity-100' : 'opacity-0'
											)}
										/>
										{option.label}
									</CommandItem>
								))}
							</CommandList>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		)
	}
)
