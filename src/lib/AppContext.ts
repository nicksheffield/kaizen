import { DirDesc, FileDesc, FSDesc } from './handle'
import { Project } from '@/lib/projectSchemas'
import { FsaNodeFs } from 'memfs/lib/fsa-to-node'
import { GitInstance } from '@/lib/git'
import { createContext, useContextSelector } from 'use-context-selector'

export type AppContextType = {
	files: FSDesc[]
	setFiles: React.Dispatch<React.SetStateAction<FSDesc[]>>
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	openFile: (path: string) => void
	openPaths: string[]
	setOpenPaths: React.Dispatch<React.SetStateAction<string[]>>
	dirOpenStatus: Record<string, boolean>
	setDirOpenStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
	selectedPath: string | undefined
	setSelectedPath: React.Dispatch<React.SetStateAction<string | undefined>>
	hasNewChanges: boolean
	setHasNewChanges: React.Dispatch<React.SetStateAction<boolean>>
	openPath: (path: string) => void

	gitConfig: Record<string, string> | null

	fs: FsaNodeFs | null
	git: GitInstance | null
	head: string
	localBranches: string[]
	remoteBranches: string[]
	selectedFile: FileDesc | undefined
	root: DirDesc | undefined

	project?: Project
	saveProject: (project: Project) => Promise<void>
	generateProject: (project?: Project) => Promise<void>
	isGenerating: boolean
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

	getRootHandle: () => Promise<void>
	clearRootHandle: () => void
	refreshFiles: () => Promise<void>
	saveFile: (
		path: string,
		content: string,
		options?: {
			showToast?: boolean
			format?: boolean
		}
	) => Promise<void>
	deleteFile: (path: string | FSDesc) => Promise<void>
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export const useApp = <S>(selector: (v: AppContextType) => S) => useContextSelector(AppContext, selector)
