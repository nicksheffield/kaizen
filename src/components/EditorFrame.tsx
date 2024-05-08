import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { ReadonlyCodeView } from './FileViews/ReadonlyView'
import { Welcome } from './Welcome'
import { SERVER_PATH } from '@/lib/constants'
import { ERDEditor } from '@/components/ERDEditor'
import { ProjectDetails } from '@/components/FileViews/ProjectDetails'
import { ProjectAuth } from '@/components/ProjectAuth'
import { ProjectEnv } from '@/components/ProjectEnv'

export const EditorFrame = () => {
	const project = useApp((v) => v.project)
	const selectedPath = useApp((v) => v.selectedPath)

	const Editor = !selectedPath ? (
		<Welcome />
	) : selectedPath === 'project.json?models' ? (
		<ERDEditor />
	) : selectedPath === 'project.json?details' ? (
		<ProjectDetails key={project?.settings.id} />
	) : selectedPath === 'project.json?auth' ? (
		<ProjectAuth key={project?.settings.id} />
	) : selectedPath === 'project.json?environment' ? (
		<ProjectEnv key={project?.settings.id} />
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
