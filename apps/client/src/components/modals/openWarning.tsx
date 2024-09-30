import { ReactNode } from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { openModal } from '@/components/Modal'
import { DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type OpenWarningProps = {
	title: ReactNode
	message?: ReactNode
	onAccept?: () => void
}

export const openWarning = (props: OpenWarningProps) => {
	return openModal({
		render: (close) => <Congratulate {...props} close={close} />,
	})
}

const Congratulate = ({ title, message, onAccept }: OpenWarningProps & { close: () => void }) => {
	return (
		<DialogContent>
			<div className="flex flex-col items-center gap-6">
				<div className="text-orange-500">
					<AlertCircleIcon className="h-10 w-10" />
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
