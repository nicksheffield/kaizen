import { MODS_PATH, SERVER_PATH } from '@/lib/constants'
import { Project, parseProject, workspaceFiles } from 'common/src'
// import { showDirectoryPicker } from 'file-system-access'
import { generators, type GeneratorFn } from 'generators/src'
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLocalStorage } from 'usehooks-ts'
import { AppContext } from '../lib/AppContext'
import { db } from '../lib/db'
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
} from '../lib/handle'

console.log('client side')

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
	const [dirOpenStatus, setDirOpenStatus] = useLocalStorage<Record<string, boolean>>('dirOpenStatus', { apps: true })

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

				if (projectFile && projectFile.content) {
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
				try {
					// get the last directory handle
					const dbDir = dbDirs.slice(-1)[0]
					setRootHandle(dbDir.handle)
					await loadFiles(dbDir.handle)
				} catch (e) {
					await db.delete()
					setRootHandle(null)
					setDraft(undefined)
					setFiles([])
				}
			} else {
				setOpenPaths([])
				setSelectedPath(undefined)
			}
		}

		init()
	}, [])

	/**
	 * Open the directory picker and set the root handle
	 */
	const getRootHandle = useCallback(async () => {
		const handle = await showDirectoryPicker({ id: 'kaizen', mode: 'readwrite' })

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
			setSelectedPath('project.json?models')
			setOpenPaths(['project.json?models'])
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
			// const file = files.find((x) => x.path === path)
			// if (!file) return

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
			const { showToast = true } = options || {}

			const path = isFile(x) ? x.path : x
			const fileName = path.split('/').pop()

			const fileHandle = await getFileHandle(path, rootHandle)

			if (fileHandle) {
				const writable = await fileHandle.createWritable({ keepExistingData: false })

				// if (format) {
				// await writable.write(await formatFile(content))
				// } else {
				await writable.write(content)
				// }

				await writable.close()

				if (showToast) {
					toast.success(`File saved: ${fileName}`, { closeButton: true })
				}

				setFiles((files) => {
					const existingFile = files.find((x) => x.path === path)
					if (!existingFile) return files
					if (!isFile(existingFile)) return files

					existingFile.content = content
					return [...files]
				})

				// await loadFiles(rootHandle)
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

		if (!file.content) return

		return parseProject(file.content)
	}, [files])

	/**
	 * Generate the project files, and write them to the devDir
	 */
	const generateProject = useCallback(
		async (projectObj?: Project) => {
			const proj = projectObj || project

			if (!proj || !rootHandle || !proj.settings.generator) return

			const generate: GeneratorFn | undefined = generators[proj.settings.generator as keyof typeof generators]

			if (!generate) return

			// // server side version
			// const seeder = files.filter(isFile).some((x) => x.path.startsWith(`${MODS_PATH}/src/seed.ts`))
			// const api = files.filter(isFile).some((x) => x.path.startsWith(`${MODS_PATH}/src/api.ts`))
			// const queries = files.filter(isFile).some((x) => x.path.startsWith(`${MODS_PATH}/src/queries.ts`))
			// const emails = files
			// 	.filter(isFile)
			// 	.filter((x) => x.path.startsWith(`${MODS_PATH}/emails`))
			// 	.map((x) => x.name)

			// const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/generate/project`, {
			// 	method: 'post',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	},
			// 	body: JSON.stringify({
			// 		project: JSON.stringify(proj),
			// 		hasSeeder: seeder,
			// 		hasApi: api,
			// 		hasQueries: queries,
			// 		emails,
			// 	}),
			// })

			// if (!response.ok) {
			// 	return
			// }

			// const responseJson = await response.json()

			// const generated = responseJson.generated as Record<string, string>
			// // server side version ends here

			// client side version
			const generated = await generate(proj, {
				seeder: files.filter(isFile).some((x) => x.path.startsWith(`${MODS_PATH}/src/seed.ts`)),
				api: files.filter(isFile).some((x) => x.path.startsWith(`${MODS_PATH}/src/api.ts`)),
				queries: files.filter(isFile).some((x) => x.path.startsWith(`${MODS_PATH}/src/queries.ts`)),
				emails: files
					.filter(isFile)
					.filter((x) => x.path.startsWith(`${MODS_PATH}/emails`))
					.map((x) => x.name),
			})
			// client side version ends here

			const generatedDescs = await convertGeneratedFilesToDescs(generated, rootHandle, SERVER_PATH)

			const unformatted = generatedDescs.filter(isFile).filter((x) => x.content.startsWith('/* unformatted */'))

			setBuildErrorPaths(unformatted.map((x) => x.path))

			await syncFiles(
				files.filter(isFile).filter((x) => x.path.startsWith(SERVER_PATH)),
				generatedDescs,
				rootHandle
			)
		},
		[files]
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
		const missingFiles = workspaceFiles(project).filter((x) => !files.find((y) => y.path === x))
		return missingFiles.length > 0
	}, [files, project])

	/**
	 * Generate the workspace files, and write them to the root directory
	 */
	const generateWorkspace = useCallback(
		async (options: { projectObj?: Project; clientChange?: boolean; name?: string }) => {
			if (!root || !root.handle) return

			const { projectObj = project, clientChange = false, name } = options || {}

			const clientRelatedFilePaths = ['package.json', '.vscode/settings.json', '.vscode/tasks.json']

			// const workspace = await workspaceGenerator({ project: projectObj, name })
			const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/generate/workspace`, {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					project: JSON.stringify(projectObj),
					name,
				}),
			})

			if (!response.ok) {
				return
			}

			const responseJson = await response.json()

			const workspace = responseJson.generated as Record<string, string>

			const filteredWorkspaceFiles = Object.fromEntries(
				Object.entries(workspace).filter(([path]) => {
					const fileExists = files.some((x) => x.path === path)
					const fileShouldCreateAnyway = clientChange && clientRelatedFilePaths.includes(path)

					return fileShouldCreateAnyway || !fileExists
				})
			)

			const workspaceDescs = await convertGeneratedFilesToDescs(filteredWorkspaceFiles, root.handle, '')

			for (const desc of workspaceDescs) {
				await saveFile(desc, desc.content, { showToast: false })
			}
		},
		[files]
	)

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
