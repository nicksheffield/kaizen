import { ReactNode } from 'react'
import { CheckCircle2Icon } from 'lucide-react'
import { openModal } from '@/components/Modal'
import { DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type OpenSuccessProps = {
	title: ReactNode
	message?: ReactNode
	onAccept?: () => void
}

export const openSuccess = (props: OpenSuccessProps) => {
	return openModal({
		render: (close) => <Congratulate {...props} close={close} />,
	})
}

const Congratulate = ({ title, message, onAccept }: OpenSuccessProps & { close: () => void }) => {
	return (
		<DialogContent>
			<div className="flex flex-col items-center gap-6">
				<div className="text-green-500">
					<CheckCircle2Icon className="h-10 w-10" />
				</div>
				<div className="text-lg">{title}</div>
				{message && <div className="text-sm text-gray-500">{message}</div>}

				<Button onClick={onAccept} variant="default">
					Ok
				</Button>
			</div>
		</DialogContent>
	)
}
