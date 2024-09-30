import { useApp } from '../../lib/AppContext'
import { MonacoEditor } from '../MonacoEditor'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { HelpCircleIcon } from 'lucide-react'

export const ReadonlyCodeView = () => {
	const selectedFile = useApp((v) => v.selectedFile)

	if (!selectedFile) return null

	return (
		<div className="relative flex min-h-0 flex-1 flex-col">
			<div className="relative flex h-10 items-center justify-center border-b bg-yellow-50 text-sm font-medium text-yellow-600 dark:bg-yellow-600/20">
				This file is read only
				<div className="absolute right-0 top-0 flex h-full items-center pr-4">
					<HoverCard>
						<HoverCardTrigger>
							<HelpCircleIcon className="w-4" />
						</HoverCardTrigger>
						<HoverCardContent className="flex flex-col gap-2">
							<p>This file is read only because it is automatically generated based on the project.</p>
							<p>Any changes to this file will be overwritten.</p>
						</HoverCardContent>
					</HoverCard>
				</div>
			</div>
			<div className="flex min-h-0 flex-1 flex-col overflow-auto">
				<MonacoEditor
					value={selectedFile.content}
					onValueChange={() => {}}
					extension={selectedFile?.extension}
					readonly={true}
				/>
			</div>
		</div>
	)
}
