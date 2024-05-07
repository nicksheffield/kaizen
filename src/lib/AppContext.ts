import { DirDesc, FileDesc, FSDesc } from './handle'
import { Project } from '@/lib/projectSchemas'
import { createContext, useContextSelector } from 'use-context-selector'

export type AppContextType = {
	root: DirDesc | undefined
	getRootHandle: () => Promise<void>
	clearRootHandle: () => void

	files: FSDesc[]
	setFiles: React.Dispatch<React.SetStateAction<FSDesc[]>>
	openPaths: string[]
	setOpenPaths: React.Dispatch<React.SetStateAction<string[]>>
	dirOpenStatus: Record<string, boolean>
	setDirOpenStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
	selectedPath: string | undefined
	setSelectedPath: React.Dispatch<React.SetStateAction<string | undefined>>
	selectedFile: FileDesc | undefined

	openFile: (path: string) => void
	saveFile: (
		path: string,
		content: string,
		options?: {
			showToast?: boolean
			format?: boolean
		}
	) => Promise<void>
	deleteFile: (path: string) => Promise<void>

	workspaceIsMissingFiles: boolean
	generateWorkspace: (project?: Project, clientChange?: boolean) => Promise<void>

	project?: Project
	saveProject: (project: Project) => Promise<void>
	generateProject: (project?: Project) => Promise<void>
	buildErrorPaths: string[]
	draft?: {
		dirty: boolean
		content: Project
	}
	setDraft: React.Dispatch<
		React.SetStateAction<
			| {
					dirty: boolean
					content: Project
			  }
			| undefined
		>
	>
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

/**
 * Access the app context with a selector, which helps prevent unnecessary re-renders
 */
export const useApp = <S>(selector: (v: AppContextType) => S) => useContextSelector(AppContext, selector)
