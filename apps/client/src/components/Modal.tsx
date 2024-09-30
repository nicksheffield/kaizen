import { Dialog } from '@/components/ui/dialog'
import { generateId } from '@/lib/utils'
import { ReactNode, Suspense, useState } from 'react'

type ModalDef = {
	id: string
	render: ReactNode
}

const container: {
	addModal: (def: ModalDef) => void
	removeModal: (id: string) => void
} = {
	addModal: () => {},
	removeModal: () => {},
}

export type ModalCloseFn = () => void

export const openModal = (x: { render: (close: ModalCloseFn) => ReactNode }) => {
	const id = generateId()
	const close = () => container.removeModal(id)

	container.addModal({
		id,
		render: x.render(close),
	})
}

export const ModalProvider = () => {
	const [defs, setDefs] = useState<ModalDef[]>([])
	const [closing, setClosing] = useState<string[]>([])

	container.addModal = (def: ModalDef) => {
		setDefs((d) => [...d, def])
	}

	container.removeModal = (id: string) => {
		setClosing((c) => [...c, id])
		setTimeout(() => {
			setDefs((d) => d.filter((x) => x.id !== id))
			setClosing((c) => c.filter((x) => x !== id))
		}, 500)
	}

	return (
		<>
			{defs.map((def) => (
				<Dialog
					key={def.id}
					open={!closing.includes(def.id)}
					onOpenChange={(val) => {
						if (!val) container.removeModal(def.id)
					}}
				>
					<Suspense fallback={null}>{def.render}</Suspense>
				</Dialog>
			))}
		</>
	)
}
