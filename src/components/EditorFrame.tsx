import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { ReadonlyCodeView } from './FileViews/ReadonlyView'
import { ProjectView } from './FileViews/ProjectView'
import { Welcome } from './Welcome'
import { SERVER_PATH } from '@/lib/constants'

export const EditorFrame = () => {
	const project = useApp((v) => v.project)
	const selectedPath = useApp((v) => v.selectedPath)

	const Editor = !selectedPath ? (
		<Welcome />
	) : selectedPath === 'project.json' ? (
		<ProjectView key={project?.settings.id} />
	) : project && selectedPath.startsWith(SERVER_PATH) ? (
		<ReadonlyCodeView key={`${project?.settings.id}-${selectedPath}`} />
	) : (
		<CodeEditor key={project?.settings.id} />
	)

	return (
		<div className="relative flex min-h-0 min-w-0 flex-1 shrink flex-col divide-y">
			<EditorTabs />

			{Editor}
		</div>
	)
}
