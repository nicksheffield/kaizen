import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { ReadonlyCodeView } from './FileViews/ReadonlyView'
import { Welcome } from '../pages/Welcome'
import { SERVER_PATH } from '@/lib/constants'

export const EditorFrame = () => {
	const project = useApp((v) => v.project)
	const selectedPath = useApp((v) => v.selectedPath)

	const compact = false

	const Editor =
		!selectedPath || !project ? (
			<Welcome />
		) : project && selectedPath.startsWith(SERVER_PATH) ? (
			<ReadonlyCodeView key={`${project?.settings.id}-${selectedPath}`} />
		) : (
			<CodeEditor key={project?.settings.id} />
		)

	return (
		<div className="relative flex min-h-0 min-w-0 flex-1 shrink flex-col gap-4">
			{!compact && <EditorTabs />}

			{Editor}
		</div>
	)
}
