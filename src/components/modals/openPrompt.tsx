import { ModalCloseFn, openModal } from '@/components/Modal'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormInputRow, useForm } from '@/components/form'
import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const Congratulate = ({
	title,
	description,
	placeholder,
	onSubmit,
	close,
}: OpenPromptProps & { close: ModalCloseFn }) => {
	const form = useForm<{ prompt: string }>({
		initialValues: {
			prompt: '',
		},
		onSubmit: async (val) => {
			await onSubmit(val.prompt)
			close()
		},
	})
	return (
		<DialogContent className="p-0">
			<DialogHeader className="px-4 pt-4">
				<DialogTitle>{title}</DialogTitle>
				{description && <DialogDescription>{description}</DialogDescription>}
			</DialogHeader>
			<Form context={form}>
				<div className="p-4">
					<FormInputRow name="prompt" placeholder={placeholder} className="flex-1" />
				</div>
				<DialogFooter className="border-t bg-muted/50 p-4">
					<Button type="submit" variant="default" disabled={form.isSubmitting} className="relative">
						<div
							className={cn(
								'absolute inset-0 flex items-center justify-center',
								!form.isSubmitting && 'opacity-0'
							)}
						>
							<Loader2Icon className="w-4 animate-spin" />
						</div>

						<div className={cn(form.isSubmitting && 'opacity-0')}>Ok</div>
					</Button>
				</DialogFooter>
			</Form>
		</DialogContent>
	)
}
