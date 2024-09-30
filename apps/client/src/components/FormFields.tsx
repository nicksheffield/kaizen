import { Hint } from '@/components/Hint'
import { Label } from '@/components/ui/label'
import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { SelectList, SelectListProps } from '@/components/SelectList'
import { DatePicker, DatePickerProps } from '@/components/ui/datepicker'
import { FormField } from '@/components/ui/form'
import { SearchableSelectList, SearchableSelectListProps } from '@/components/SearchableSelectList'
import { Switch, SwitchProps } from '@/components/ui/switch'

type FormRowProps = {
	label?: string
	description?: string
	hint?: string
	className?: string
}

export const FormRow = ({ label, description, hint, className, children }: PropsWithChildren<FormRowProps>) => {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{label && (
				<Label className="flex items-center gap-2">
					{label}
					{hint && <Hint content={hint} className="-my-1" />}
				</Label>
			)}
			{description && <div className="-mt-1 text-xs opacity-60">{description}</div>}
			{children}
		</div>
	)
}

export const FormError = ({ name }: { name: string }) => {
	const { formState } = useFormContext()

	const errors = formState.errors[name]

	return errors ? <div className="text-destructive">{errors?.message?.toString()}</div> : null
}

type FormInputProps = Omit<InputProps, 'name'> & {
	name: string
	register?: RegisterOptions
}

export const FormInput = ({ name, register, ...props }: FormInputProps) => {
	const form = useFormContext()

	return (
		<>
			<FormField
				name={name}
				rules={register}
				control={form.control}
				render={({ field }) => <Input {...props} {...field} />}
			/>
			<FormError name={name} />
		</>
	)
}

type FormSelectListProps = Omit<SelectListProps, 'value' | 'onValueChange'> & {
	name: string
	register?: RegisterOptions
}

export const FormSelectList = ({ name, register, ...props }: FormSelectListProps) => {
	const form = useFormContext()

	return (
		<>
			<FormField
				name={name}
				rules={register}
				control={form.control}
				render={({ field }) => <SelectList {...props} {...field} onValueChange={field.onChange} />}
			/>
			<FormError name={name} />
		</>
	)
}

type FormSearchableSelectListProps = Omit<SearchableSelectListProps, 'value' | 'onValueChange'> & {
	name: string
	register?: RegisterOptions
}

export const FormSearchableSelectList = ({ name, register, ...props }: FormSearchableSelectListProps) => {
	const form = useFormContext()

	return (
		<>
			<FormField
				name={name}
				rules={register}
				control={form.control}
				render={({ field }) => <SearchableSelectList {...props} {...field} onValueChange={field.onChange} />}
			/>
			<FormError name={name} />
		</>
	)
}

type FormDateProps = DatePickerProps & {
	name: string
	register?: RegisterOptions
	className?: string
}

export const FormDate = ({ name, register, ...props }: FormDateProps) => {
	const form = useFormContext()

	return (
		<>
			<FormField
				name={name}
				rules={register}
				control={form.control}
				render={({ field }) => <DatePicker {...props} {...field} onValueChange={field.onChange} />}
			/>
			<FormError name={name} />
		</>
	)
}

type FormSwitchProps = SwitchProps & {
	name: string
	register?: RegisterOptions
	className?: string
}

export const FormSwitch = ({ name, register, ...props }: FormSwitchProps) => {
	const form = useFormContext()

	return (
		<>
			<FormField
				name={name}
				rules={register}
				control={form.control}
				render={({ field }) => (
					<Switch {...props} {...field} checked={field.value} onCheckedChange={field.onChange} />
				)}
			/>
			<FormError name={name} />
		</>
	)
}
