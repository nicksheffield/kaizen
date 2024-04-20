import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	FSDesc,
	FileDesc,
	convertGeneratedFilesToDescs,
	getFileHandle,
	getHandleTreeFromHandle,
	isDir,
	isFile,
	rm,
	sortFilesByPath,
	syncFiles,
} from '../lib/handle'
import { AppContext } from '../lib/AppContext'
import { db } from '../lib/db'
import { format as formatFile } from '@/lib/utils'
import { useLocalStorage } from 'usehooks-ts'
import { generators } from '@/generators'
import deepEqual from 'deep-equal'
import ini from 'ini'
import { FsaNodeFs } from 'memfs/lib/fsa-to-node'
import type * as fsa from 'memfs/lib/fsa/types'
import { createGitInstance } from '@/lib/git'
import { GeneratorFn } from '@/generators'
import { Project, parseProject } from '@/lib/projectSchemas'
import { toast } from 'sonner'

const checkFilesChanged = (a: FSDesc[], b: FSDesc[]) => {
	if (a.length !== b.length) return true

	for (let i = 0; i < a.length; i++) {
		if (a[i].path !== b[i].path) return true
	}

	for (let i = 0; i < a.length; i++) {
		const x = a[i]
		const y = b[i]

		if (isDir(x)) continue
		if (isDir(y)) continue

		if (x.content !== y.content) return true
	}

	return false
}

export const AppProvider = ({ children }: PropsWithChildren) => {
	const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null)
	const [files, setFiles] = useState<FSDesc[]>([])

	const [openPaths, setOpenPaths] = useLocalStorage<string[]>('openPaths', [])
	const [selectedPath, setSelectedPath] = useLocalStorage<string | undefined>('selectedPath', undefined)
	const [dirOpenStatus, setDirOpenStatus] = useLocalStorage<Record<string, boolean>>('dirOpenStatus', { '': true })
	const [loading, setLoading] = useState(false)

	const [buildErrorPaths, setBuildErrorPaths] = useState<string[]>([])

	const [draft, setDraft] = useState<{ dirty: boolean; content: Project } | undefined>(undefined)
	const [hasNewChanges, setHasNewChanges] = useState(false)

	const timer = useRef<number | null>(null)

	const selectedFile = useMemo(() => files.filter(isFile).find((x) => x.path === selectedPath), [files, selectedPath])
	const root = useMemo(() => files.filter(isDir).find((x) => x.path === ''), [files])

	const [gitConfig, setGitConfig] = useState<Record<string, string> | null>(null)

	const openPath = useCallback(
		(path: string) => {
			setSelectedPath(path)
			setOpenPaths((x) => {
				if (x.includes(path)) return x
				return [...x, path]
			})
		},
		[openPaths]
	)

	const clearRootHandle = useCallback(async () => {
		await db.dirs.clear()
		setRootHandle(null)
		setFiles([])
		setOpenPaths([])
		setSelectedPath(undefined)
		setDirOpenStatus({ '': true })
	}, [])

	const openFile = useCallback(
		(path: string) => {
			setSelectedPath(path)
			setOpenPaths((x) => {
				if (x.includes(path)) return x
				return [...x, path]
			})
		},
		[files]
	)

	// the current branch according to the .git/HEAD file
	const head =
		files
			.filter(isFile)
			.find((x) => x.path === '.git/HEAD')
			?.content.replace('ref: refs/heads/', '')
			.trim() || ''

	// all the branches in the .git/refs/heads directory
	const localBranches = useMemo(() => {
		const branches = files
			.filter((x) => x.type === 'file' && x.path.startsWith('.git/refs/heads'))
			.map((x) => x.path.replace('.git/refs/heads/', '').trim())

		return branches
	}, [files])

	const remoteBranches = useMemo(
		() =>
			files
				.filter((x) => x.type === 'file' && x.path.startsWith('.git/refs/remotes'))
				.map((x) => x.path.replace('.git/refs/remotes/', '').trim()),
		[files]
	)

	const fs = useMemo(() => {
		if (!root) return null
		return new FsaNodeFs(root.handle as unknown as fsa.IFileSystemDirectoryHandle)
	}, [root])

	const git = useMemo(() => {
		if (!fs) return null
		return createGitInstance(fs)
	}, [fs])

	// load all the files in the root directory
	const loadFiles = useCallback(
		async (dirHandle: FileSystemDirectoryHandle) => {
			const loadedFiles = await getHandleTreeFromHandle(dirHandle)

			// sort files by directory first, and then alphabetically
			const sortedFiles = loadedFiles.sort(sortFilesByPath)

			if (checkFilesChanged(files, sortedFiles)) {
				setFiles(sortedFiles)

				const projectFile = sortedFiles.filter(isFile).find((x) => x.path === 'project.json')

				if (projectFile) {
					const project = parseProject(projectFile.content)
					setDraft({ dirty: false, content: project })
				}

				const gitconf = sortedFiles.filter(isFile).find((x) => x.path === '.git/config')

				if (gitconf) {
					setGitConfig(ini.parse(gitconf.content || ''))
				}
			}
		},
		[files]
	)

	/**
	 * load the root directory from the database if it exists
	 */
	useEffect(() => {
		const init = async () => {
			const dbDirs = await db.dirs.toArray()
			if (dbDirs.length) {
				const dbDir = dbDirs.slice(-1)[0]
				setRootHandle(dbDir.handle)
				await loadFiles(dbDir.handle)
			}
		}

		init()
	}, [])

	/**
	 * open the directory picker and set the root handle
	 */
	const getRootHandle = useCallback(async () => {
		const handle = await window.showDirectoryPicker({ id: 'kaizen', mode: 'readwrite' })

		setRootHandle(handle)

		const dbDirs = await db.dirs.toArray()

		if (!dbDirs.length) {
			await db.dirs.add({ handle })
		} else {
			await db.dirs.update(dbDirs.slice(-1)[0].id || 1, { handle })
		}

		setLoading(true)
		await loadFiles(handle)
		setLoading(false)
	}, [loadFiles])

	/**
	 * refresh the files in the root directory
	 */
	const refreshFiles = useCallback(async () => {
		if (rootHandle) loadFiles(rootHandle)
	}, [rootHandle, loadFiles])

	/**
	 * refresh files every 2 seconds
	 */
	useEffect(() => {
		if (timer.current) clearInterval(timer.current)

		timer.current = window.setInterval(() => {
			refreshFiles()
		}, 1000 * 2)
	}, [refreshFiles])

	/**
	 * save any file to the file system
	 */
	const saveFile = useCallback(
		async (x: FileDesc | string, content: string, options?: { showToast?: boolean; format?: boolean }) => {
			if (!rootHandle) return
			const { showToast = true, format = false } = options || {}

			const path = isFile(x) ? x.path : x
			const fileName = path.split('/').pop()

			const fileHandle = await getFileHandle(path, rootHandle)

			if (fileHandle) {
				const writable = await fileHandle.createWritable({ keepExistingData: false })
				if (format) {
					await writable.write(await formatFile(content))
				} else {
					await writable.write(content)
				}
				await writable.close()
				if (showToast) toast.success(`File saved: ${fileName}`)
				await loadFiles(rootHandle)
			}
		},
		[rootHandle, files, getFileHandle, loadFiles]
	)

	const project = useMemo(() => {
		const file = files.find((x) => x.path === 'project.json')
		if (!file || isDir(file)) return undefined

		return parseProject(file.content)
	}, [files])

	const [isGenerating, setIsGenerating] = useState(false)
	const generateProject = useCallback(
		async (project?: Project) => {
			if (!project || !rootHandle || !project.project.generator) return
			setIsGenerating(true)

			const generate: GeneratorFn | undefined = generators[project.project.generator as keyof typeof generators]

			if (!generate) return

			const generated = await generate(project, {
				seeder: files.filter(isFile).find((x) => x.path.startsWith('kaizen/seed.ts'))?.content,
				emails: files
					.filter(isFile)
					.filter((x) => x.path.startsWith('kaizen/emails'))
					.reduce<Record<string, string>>((acc, file) => {
						acc[file.name] = file.content
						return acc
					}, {}),
			})

			const generatedDescs = await convertGeneratedFilesToDescs(generated, rootHandle, project.project.devDir)

			const unformatted = generatedDescs.filter(isFile).filter((x) => x.content.startsWith('/* unformatted */'))

			setBuildErrorPaths(unformatted.map((x) => x.path))

			await syncFiles(
				files.filter(isFile).filter((x) => x.path.startsWith(project.project.devDir)),
				generatedDescs,
				rootHandle
			)

			setIsGenerating(false)
		},
		[getFileHandle, files]
	)

	const saveProject = useCallback(
		async (project: Project) => {
			await saveFile('project.json', JSON.stringify(project, null, 4).replace(/    /g, '\t'), {
				showToast: false,
			})
			setDraft({ dirty: false, content: project })
			await generateProject(project)
		},
		[saveFile]
	)

	const deleteFile = useCallback(
		async (file: string | FSDesc) => {
			const path = typeof file === 'string' ? file : file.path
			const parent = files.filter(isDir).find((x) => x.path === path.split('/').slice(0, -1).join('/'))

			if (!parent || !parent.handle) return

			await rm(parent.handle, path.split('/').pop() || '')
		},
		[files]
	)

	// detect if the underlying project changes, and if so, just notify that there are new changes
	useEffect(() => {
		if (!project || !draft?.content) return

		if (!deepEqual(project, draft?.content)) {
			setHasNewChanges(true)
		}
	}, [project])

	const value = useMemo(
		() => ({
			files,
			setFiles,
			openFile,
			openPaths,
			setOpenPaths,
			dirOpenStatus,
			setDirOpenStatus,
			selectedPath,
			setSelectedPath,
			loading,
			setLoading,
			hasNewChanges,
			setHasNewChanges,
			openPath,

			gitConfig,

			fs,
			git,
			head,
			localBranches,
			remoteBranches,
			selectedFile,
			root,

			project,
			saveProject,
			generateProject,
			isGenerating,
			buildErrorPaths,
			draft,
			setDraft,

			getRootHandle,
			clearRootHandle,
			refreshFiles,
			saveFile,
			deleteFile,
		}),
		[
			files,
			setFiles,
			openFile,
			openPaths,
			setOpenPaths,
			dirOpenStatus,
			setDirOpenStatus,
			selectedPath,
			setSelectedPath,
			loading,
			setLoading,
			hasNewChanges,
			setHasNewChanges,
			openPath,

			gitConfig,

			fs,
			git,
			head,
			localBranches,
			remoteBranches,
			selectedFile,
			root,

			project,
			saveProject,
			generateProject,
			isGenerating,
			buildErrorPaths,
			draft,
			setDraft,

			getRootHandle,
			clearRootHandle,
			refreshFiles,
			saveFile,
			deleteFile,
		]
	)

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
