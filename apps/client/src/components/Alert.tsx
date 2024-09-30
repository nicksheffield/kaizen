import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'
import { ReactNode, useState } from 'react'

type AlertDef = {
	id: string
	render: ReactNode
}

const container: {
	addAlert: (def: AlertDef) => void
	removeAlert: (id: string) => void
} = {
	addAlert: () => {},
	removeAlert: () => {},
}

export type CloseFn = () => void

export const openAlert = (x: { render: (close: CloseFn) => ReactNode }) => {
	const id = generateId()
	const close = () => container.removeAlert(id)

	container.addAlert({
		id,
		render: x.render(close),
	})
}

export const AlertProvider = () => {
	const [defs, setDefs] = useState<AlertDef[]>([])
	const [closing, setClosing] = useState<string[]>([])

	container.addAlert = (def: AlertDef) => {
		setDefs((d) => [...d, def])
	}

	container.removeAlert = (id: string) => {
		setClosing((c) => [...c, id])
		setTimeout(() => {
			setDefs((d) => d.filter((x) => x.id !== id))
			setClosing((c) => c.filter((x) => x !== id))
		}, 500)
	}

	return (
		<>
			{defs.map((def) => (
				<AlertDialog
					key={def.id}
					open={!closing.includes(def.id)}
					onOpenChange={(val) => {
						if (!val) container.removeAlert(def.id)
					}}
				>
					{def.render}
				</AlertDialog>
			))}
		</>
	)
}

type OpenConfirmProps = {
	title: ReactNode
	message?: ReactNode
	buttonLabel?: string
	variant?: 'default' | 'destructive'
	onSubmit: () => void | Promise<void>
}

export const openConfirm = (props: OpenConfirmProps) => {
	openAlert({
		render: (close) => <Confirm close={close} {...props} />,
	})
}

const Confirm = ({ title, message, buttonLabel, variant, onSubmit, close }: OpenConfirmProps & { close: CloseFn }) => {
	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{title}</AlertDialogTitle>
				{message && <AlertDialogDescription>{message}</AlertDialogDescription>}
			</AlertDialogHeader>
			<AlertDialogFooter>
				<Button variant="ghost" onClick={close}>
					No
				</Button>

				<Button
					autoFocus
					variant={variant}
					onClick={async () => {
						await onSubmit()
						close()
					}}
				>
					{buttonLabel || 'Yes'}
				</Button>
			</AlertDialogFooter>
		</AlertDialogContent>
	)
}
