import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { ReadonlyCodeView } from './FileViews/ReadonlyView'
import { Welcome } from './Welcome'
import { SERVER_PATH } from '@/lib/constants'
import { ERDEditor } from '@/components/ERDEditor'
import { ProjectDetails } from '@/components/FileViews/ProjectDetails'
import { ProjectAuth } from '@/components/FileViews/ProjectAuth'
import { ProjectEnv } from '@/components/FileViews/ProjectEnv'
import { useLocalStorage } from 'usehooks-ts'
import { ProjectHelpers } from '@/components/FileViews/ProjectHelpers'

export const EditorFrame = () => {
	const project = useApp((v) => v.project)
	const selectedPath = useApp((v) => v.selectedPath)

	const [compact] = useLocalStorage('compact-mode', false)

	const Editor =
		!selectedPath || !project ? (
			<Welcome />
		) : selectedPath === 'project.json?models' ? (
			<ERDEditor key={project?.settings.id} />
		) : selectedPath === 'project.json?details' ? (
			<ProjectDetails key={project?.settings.id} />
		) : selectedPath === 'project.json?auth' ? (
			<ProjectAuth key={project?.settings.id} />
		) : selectedPath === 'project.json?environment' ? (
			<ProjectEnv key={project?.settings.id} />
		) : selectedPath === 'project.json?helpers' ? (
			<ProjectHelpers key={project?.settings.id} />
		) : project && selectedPath.startsWith(SERVER_PATH) ? (
			<ReadonlyCodeView key={`${project?.settings.id}-${selectedPath}`} />
		) : (
			<CodeEditor key={project?.settings.id} />
		)

	return (
		<div className="relative flex min-h-0 min-w-0 flex-1 shrink flex-col divide-y">
			{!compact && <EditorTabs />}

			{Editor}
		</div>
	)
}
