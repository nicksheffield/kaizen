import { ModalCloseFn, openModal } from '@/components/Modal'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { FormInput } from '@/components/FormFields'

type OpenPromptProps = {
	title: string
	description?: string
	placeholder?: string
	onSubmit: (val: string) => Promise<void> | void
}

export const openPrompt = (props: OpenPromptProps) => {
	return openModal({
		render: (close) => <Congratulate {...props} close={close} />,
	})
}

type FormState = { prompt: string }

const Congratulate = ({
	title,
	description,
	placeholder,
	onSubmit,
	close,
}: OpenPromptProps & { close: ModalCloseFn }) => {
	const form = useForm<FormState>({
		defaultValues: {
			prompt: '',
		},
	})

	const handleSubmit = async (val: FormState) => {
		await onSubmit(val.prompt)
		close()
	}

	return (
		<DialogContent className="p-0">
			<DialogHeader className="px-4 pt-4">
				<DialogTitle>{title}</DialogTitle>
				{description && <DialogDescription>{description}</DialogDescription>}
			</DialogHeader>
			<Form context={form} onSubmit={handleSubmit}>
				<div className="p-4">
					<FormInput name="prompt" placeholder={placeholder} className="flex-1" />
				</div>
				<DialogFooter className="border-t bg-muted p-4">
					<Button type="submit" variant="default" disabled={form.formState.isSubmitting} className="relative">
						<div
							className={cn(
								'absolute inset-0 flex items-center justify-center',
								!form.formState.isSubmitting && 'opacity-0'
							)}
						>
							<Loader2Icon className="w-4 animate-spin" />
						</div>

						<div className={cn(form.formState.isSubmitting && 'opacity-0')}>Ok</div>
					</Button>
				</DialogFooter>
			</Form>
		</DialogContent>
	)
}
