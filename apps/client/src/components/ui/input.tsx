import * as React from 'react'

import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'

const inputVariants = cva(
	'flex w-full rounded-md border border-input bg-background text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:border-ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				default: 'h-10 px-3 py-2 text-sm',
				sm: 'h-8 px-2 py-1 text-sm',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	}
)

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, size, ...props }, ref) => {
	return <input type={type} className={cn(inputVariants({ size, className }))} ref={ref} {...props} />
})
Input.displayName = 'Input'

export { Input }
