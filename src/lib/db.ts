import Dexie, { Table } from 'dexie'

/**
 * We use dexie to access the indexedDB database.
 * This is a simple database with a single table to store the directory handle.
 * It's like localstorage but capable of storing more complex data, such as FSA handles.
 */

export interface DbDir {
	id?: number
	handle: FileSystemDirectoryHandle
}

export class MySubClassedDexie extends Dexie {
	dirs!: Table<DbDir>

	constructor() {
		super('kaizen')
		this.version(1).stores({
			dirs: '++id, handle', // Primary key and indexed props
		})
	}
}

export const db = new MySubClassedDexie()
