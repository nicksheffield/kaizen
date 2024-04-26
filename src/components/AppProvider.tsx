import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	FSDesc,
	FileDesc,
	checkFilesChanged,
	convertGeneratedFilesToDescs,
	getFileHandle,
	getHandleTreeFromHandle,
	isDir,
	isFile,
	rm,
	sortFilesByPath,
	syncFiles,
	verifyPermission,
} from '../lib/handle'
import { AppContext } from '../lib/AppContext'
import { db } from '../lib/db'
import { format as formatFile } from '@/lib/utils'
import { useLocalStorage } from 'usehooks-ts'
import { generators } from '@/generators'
import { GeneratorFn } from '@/generators'
import { workspaceFiles, generate as workspaceGenerator } from '@/generators/workspace'
import { Project, parseProject } from '@/lib/projectSchemas'
import { toast } from 'sonner'

export const AppProvider = ({ children }: PropsWithChildren) => {
	/**
	 * The File System Access handle to the root directory
	 */
	const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null)

	/**
	 * The files in the root directory
	 */
	const [files, setFiles] = useState<FSDesc[]>([])

	/**
	 * The paths of open files
	 */
	const [openPaths, setOpenPaths] = useLocalStorage<string[]>('openPaths', [])

	/**
	 * The path of the selected file
	 */
	const [selectedPath, setSelectedPath] = useLocalStorage<string | undefined>('selectedPath', undefined)

	/**
	 * The open status of directories
	 */
	const [dirOpenStatus, setDirOpenStatus] = useLocalStorage<Record<string, boolean>>('dirOpenStatus', { '': true })

	/**
	 * The paths of files with build errors
	 */
	const [buildErrorPaths, setBuildErrorPaths] = useState<string[]>([])

	/**
	 * An object that contains an in-progress project change
	 */
	const [draft, setDraft] = useState<{ dirty: boolean; content: Project } | undefined>(undefined)

	/**
	 * A timer for refreshing the files
	 */
	const timer = useRef<number | null>(null)

	/**
	 * The selected file
	 */
	const selectedFile = useMemo(() => files.filter(isFile).find((x) => x.path === selectedPath), [files, selectedPath])

	/**
	 * The root directory
	 */
	const root = useMemo(() => files.filter(isDir).find((x) => x.path === ''), [files])

	/**
	 * Clear the root handle and all files
	 */
	const clearRootHandle = useCallback(async () => {
		await db.dirs.clear()
		setRootHandle(null)
		setFiles([])
		setOpenPaths([])
		setSelectedPath(undefined)
		setDirOpenStatus({ '': true })
	}, [])

	/**
	 * Load all the files in the root directory
	 */
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
			}

			return sortedFiles
		},
		[files]
	)

	/**
	 * Load the root directory from the database if it exists
	 */
	useEffect(() => {
		const init = async () => {
			const dbDirs = await db.dirs.toArray()
			if (dbDirs.length) {
				// get the last directory handle
				const dbDir = dbDirs.slice(-1)[0]
				await verifyPermission(dbDir.handle)
				setRootHandle(dbDir.handle)
				await loadFiles(dbDir.handle)
			}
		}

		init()
	}, [])

	/**
	 * Open the directory picker and set the root handle
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

		const files = await loadFiles(handle)

		const projectFile = files.filter(isFile).find((x) => x.path === 'project.json')

		if (projectFile) {
			setSelectedPath('project.json')
			setOpenPaths(['project.json'])
		}
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
	 * Open a file by path
	 */
	const openFile = useCallback(
		(path: string) => {
			const file = files.find((x) => x.path === path)
			if (!file) return

			setSelectedPath(path)
			setOpenPaths((x) => {
				if (x.includes(path)) return x
				return [...x, path]
			})
		},
		[files]
	)

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

	/**
	 * Delete a file by path
	 */
	const deleteFile = useCallback(
		async (path: string) => {
			const parent = files.filter(isDir).find((x) => x.path === path.split('/').slice(0, -1).join('/'))

			if (!parent || !parent.handle) return

			await rm(parent.handle, path.split('/').pop() || '')
		},
		[files]
	)

	/**
	 * The content of the project.json file, if it exits in the files
	 */
	const project = useMemo(() => {
		const file = files.find((x) => x.path === 'project.json')
		if (!file || isDir(file)) return undefined

		return parseProject(file.content)
	}, [files])

	/**
	 * Generate the project files, and write them to the devDir
	 */
	const generateProject = useCallback(
		async (project?: Project) => {
			if (!project || !rootHandle || !project.project.generator) return

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
		},
		[getFileHandle, files]
	)

	/**
	 * Save the project to the file system and generate the project files
	 */
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

	const workspaceIsMissingFiles = useMemo(() => {
		return workspaceFiles.some((x) => !files.find((y) => y.path === x))
	}, [files])

	/**
	 * Generate the workspace files, and write them to the root directory
	 */
	const generateWorkspace = useCallback(async () => {
		if (!root || !root.handle) return

		const workspace = await workspaceGenerator({ project })
		const filteredWorkspace = Object.fromEntries(
			Object.entries(workspace).filter(([path, _]) => {
				return !files.find((x) => x.path === path.slice(1))
			})
		)

		const workspaceDescs = await convertGeneratedFilesToDescs(filteredWorkspace, root.handle, '')

		for (const desc of workspaceDescs) {
			saveFile(desc, desc.content, { showToast: false })
		}
	}, [files])

	/**
	 * Memoize the context object to prevent unnecessary re-renders
	 */
	const value = useMemo(
		() => ({
			root,
			getRootHandle,
			clearRootHandle,

			files,
			setFiles,
			openPaths,
			setOpenPaths,
			dirOpenStatus,
			setDirOpenStatus,
			selectedPath,
			setSelectedPath,
			selectedFile,

			openFile,
			saveFile,
			deleteFile,

			workspaceIsMissingFiles,
			generateWorkspace,

			project,
			saveProject,
			generateProject,
			buildErrorPaths,
			draft,
			setDraft,
		}),
		[
			root,
			getRootHandle,
			clearRootHandle,

			files,
			setFiles,
			openPaths,
			setOpenPaths,
			dirOpenStatus,
			setDirOpenStatus,
			selectedPath,
			setSelectedPath,
			selectedFile,

			openFile,
			saveFile,
			deleteFile,

			workspaceIsMissingFiles,
			generateWorkspace,

			project,
			saveProject,
			generateProject,
			buildErrorPaths,
			draft,
			setDraft,
		]
	)

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
