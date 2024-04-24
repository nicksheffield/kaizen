/**
 * Type describing a directory
 */
export type DirDesc = {
	type: 'directory'
	name: string
	path: string
	handle?: FileSystemDirectoryHandle | null
}

/**
 * Type describing a file
 */
export type FileDesc = {
	type: 'file'
	name: string
	path: string
	extension: string
	content: string
	handle?: FileSystemFileHandle | null
}

/**
 * Type describing a file or directory
 */
export type FSDesc = DirDesc | FileDesc

/**
 * Check if an object is a FileDesc
 */
export const isFile = (x: any): x is FileDesc => typeof x === 'object' && x.hasOwnProperty('type') && x.type === 'file'

/**
 * Check if a file is a DirDesc
 */
export const isDir = (x: any): x is DirDesc =>
	typeof x === 'object' && x.hasOwnProperty('type') && x.type === 'directory'

/**
 * A sorter function that puts directories before files, and after that sorts by path alphabetically
 */
export const sortFilesByPath = (a: FSDesc, b: FSDesc) => {
	if (a.type === 'directory' && b.type === 'file') return -1
	if (a.type === 'file' && b.type === 'directory') return 1
	return a.path.localeCompare(b.path)
}

/**
 * file or folder names to skip when traversing a directory
 */
const skip = ['node_modules', '.next', '.vscode', '.DS_Store', '.git']

/**
 * Get a tree of Desc objects by recursively traversing a directory handle
 */
export const getHandleTreeFromHandle = async (
	dirHandle: FileSystemDirectoryHandle,
	path: string = ''
): Promise<FSDesc[]> => {
	const entries = dirHandle.values()
	let entriesArray: FSDesc[] = []

	for await (const entry of entries) {
		if (skip.includes(entry.name)) continue
		if (entry.name.endsWith('.crswap')) continue

		const nextPath = [path, entry.name].filter((x) => x !== '').join('/')
		if (entry.kind === 'directory') {
			const subFiles = await getHandleTreeFromHandle(entry, nextPath)
			entriesArray = [...entriesArray, ...subFiles]
		} else {
			const file = await entry.getFile()
			entriesArray = [
				...entriesArray,
				{
					name: entry.name,
					path: nextPath,
					type: 'file',
					extension: entry.name.split('.').pop() || '.txt',
					content: await file.text(),
					handle: await dirHandle.getFileHandle(entry.name),
				},
			]
		}
	}

	return [
		{
			name: dirHandle.name,
			path,
			type: 'directory',
			handle: dirHandle,
		},
		...entriesArray,
	]
}

/**
 * Get a directory handle from a path
 */
export const getDirHandle = async (
	path: string,
	rootHandle: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | null> => {
	const parts = path.split('/').filter((x) => x !== '')

	if (parts.length === 0) return rootHandle

	const nextDir = await rootHandle.getDirectoryHandle(parts[0], { create: true })
	return getDirHandle(parts.slice(1).join('/'), nextDir)
}

/**
 * Get a file handle from a path
 */
export const getFileHandle = async (path: string, rootHandle: FileSystemDirectoryHandle) => {
	if (!rootHandle) return null

	const checkDir = async (path: string, dir: FileSystemDirectoryHandle): Promise<FileSystemFileHandle | null> => {
		const parts = path.split('/').filter((x) => x !== '')

		if (parts.length === 1) {
			return dir.getFileHandle(path.split('/').pop() || '', { create: true })
		}

		const nextDir = await dir.getDirectoryHandle(parts[0], { create: true })
		return checkDir(parts.slice(1).join('/'), nextDir)
	}

	const newHandle = await checkDir(path, rootHandle)

	return newHandle
}

/**
 * Write content to a file handle
 */
export const write = async (fileHandle: FileSystemFileHandle, content: string) => {
	const writable = await fileHandle.createWritable({ keepExistingData: false })
	await writable.write(content)
	await writable.close()
}

/**
 * Create a directory and return the handle
 */
export const mkdir = async (dirHandle: FileSystemDirectoryHandle, name: string) => {
	await dirHandle.getDirectoryHandle(name, { create: true })
}

/**
 * Delete a file from a directory
 */
export const rm = async (dirHandle: FileSystemDirectoryHandle, name: string) => {
	await dirHandle.removeEntry(name, { recursive: true })
}

/**
 * Convert an object of type Record<fileName, fileContent> to an array of FileDesc objects
 */
export const convertGeneratedFilesToDescs = async (
	generated: Record<string, string>,
	rootHandle: FileSystemDirectoryHandle,
	buildDir: string
) => {
	const items: FileDesc[] = []

	const entries = Object.entries(generated)

	for (const [path, content] of entries) {
		items.push({
			type: 'file',
			name: path.split('/').pop() || '',
			path: `${buildDir}${path}`,
			extension: path.split('.').pop() || '.txt',
			content,
			handle: await getFileHandle(`${buildDir}${path}`, rootHandle),
		})
	}

	return items
}

/**
 * Sync two arrays of FileDesc's, deleting, adding and updating as necessary
 */
export const syncFiles = async (files: FileDesc[], newFiles: FileDesc[], rootHandle: FileSystemDirectoryHandle) => {
	const sortedFiles = files.sort(sortFilesByPath)
	const sortedNewFiles = newFiles.sort(sortFilesByPath)

	console.group('syncing files')

	// look through all the new files
	for (const newFile of sortedNewFiles) {
		const found = sortedFiles.find((x) => x.path === newFile.path)

		// if this new file is not in the old files, add it
		if (!found) {
			if (!newFile.handle) continue

			if (!isDir(newFile)) {
				console.log('adding file', newFile.path)
				write(newFile.handle, newFile.content)
			}
		} else {
			// if the file is in the old files, update it
			if (!isFile(newFile) || !isFile(found)) continue

			if (newFile.content !== found.content) {
				if (newFile.handle) {
					console.log('updating file', newFile.path)
					write(newFile.handle, newFile.content)
				}
			}
		}
	}

	// look through all the old files
	for (const file of sortedFiles) {
		const found = sortedNewFiles.find((x) => x.path === file.path)

		// if this old file is not in the new files, delete it
		if (!found) {
			if (!file.handle) continue

			console.log('deleting file', file.path)
			const parentDir = await getDirHandle(file.path.split('/').slice(0, -1).join('/'), rootHandle)
			parentDir?.removeEntry(file.name)
		}
	}

	// go through every folder and delete it if it's empty
	const dirs = files
		.map((x) => x.path.split('/').slice(0, -1).join('/'))
		.filter((x, i, a) => a.indexOf(x) === i)
		.sort((a, b) => {
			if (a.split('/').length > b.split('/').length) return -1
			if (a.split('/').length < b.split('/').length) return 1
			return 0
		})

	for (const dir of dirs) {
		const handle = await getDirHandle(dir, rootHandle)

		let len = 0
		for await (const _ of handle?.values() || []) {
			len++
		}

		if (len === 0) {
			console.log('deleting dir', dir)
			const parent = await getDirHandle(dir.split('/').slice(0, -1).join('/'), rootHandle)
			parent?.removeEntry(dir.split('/').pop() || '')
		}
	}
	console.groupEnd()
}

/**
 * Check if two arrays of FSDesc's are different
 */
export const checkFilesChanged = (a: FSDesc[], b: FSDesc[]) => {
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
