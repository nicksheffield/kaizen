import { useMemo, useState } from 'react'
import { useApp } from '../../lib/AppContext'
import { Button } from '../ui/button'
import { SaveIcon } from 'lucide-react'
import { MonacoEditor } from '../MonacoEditor'
import { SERVER_PATH } from '@/lib/constants'

export const CodeEditor = () => {
	const selectedFile = useApp((v) => v.selectedFile)
	const saveFile = useApp((v) => v.saveFile)
	const project = useApp((v) => v.project)

	const [value, setValue] = useState(selectedFile?.content || '')

	const hasChanges = useMemo(() => {
		return selectedFile?.content !== value
	}, [selectedFile, value])

	const format = selectedFile?.extension === 'ts'

	if (!selectedFile) return null

	return (
		<div className="relative flex min-h-0 flex-1 flex-col divide-y">
			<div className="flex h-10 items-center gap-3 px-4">
				<Button
					variant="pip"
					size="pip"
					onClick={() => {
						saveFile(selectedFile.path, value, { showToast: true, format })
					}}
					disabled={!hasChanges}
				>
					<SaveIcon className="mr-2 h-4 w-4" />
					Save
				</Button>
			</div>

			<div
				className="flex min-h-0 flex-1 flex-col overflow-auto"
				onKeyDown={(e) => {
					if (e.key === 's' && e.metaKey) {
						e.stopPropagation()
						e.preventDefault()

						saveFile(selectedFile.path, value)
					}
				}}
			>
				<MonacoEditor
					value={value}
					onValueChange={(val) => setValue(val)}
					extension={selectedFile?.extension}
					readonly={
						project &&
						selectedFile.path.startsWith(SERVER_PATH) &&
						selectedFile.path !== `${SERVER_PATH}/.env`
					}
				/>
			</div>
		</div>
	)
}
