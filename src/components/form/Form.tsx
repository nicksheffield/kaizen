import { type ReactNode } from 'react'
import {
	type FormikConfig,
	Form as FormikForm,
	type FormikProps,
	type FormikHelpers,
	FormikProvider,
	useFormik,
	type FormikValues,
} from 'formik'
import { cn } from '@/lib/utils'

type FormikRenderProp<T> = (props: FormikProps<T>) => ReactNode

export const isFormikRenderProp = <T,>(prop: unknown): prop is FormikRenderProp<T> => {
	return typeof prop === 'function'
}

interface FormProps<T> {
	children: ReactNode | FormikRenderProp<T>
	context: FormikProps<T>
	className?: string
}

export const Form = <T,>({ children, className, context }: FormProps<T>) => {
	return (
		<FormikProvider value={context}>
			<FormikForm className={cn('contents', className)}>
				<fieldset disabled={context.isSubmitting} className="group contents">
					{isFormikRenderProp<T>(children) ? children(context) : children}
				</fieldset>
			</FormikForm>
		</FormikProvider>
	)
}

export const useForm = <T extends FormikValues>({ onSubmit, ...props }: FormikConfig<T>) => {
	// https://github.com/formium/formik/issues/739
	const handleSubmit = async (formData: T, helpers: FormikHelpers<T>) => {
		await onSubmit(formData, helpers)
		helpers.setSubmitting(false)
	}

	const context = useFormik({
		onSubmit: handleSubmit,
		...props,
	})

	return context
}
