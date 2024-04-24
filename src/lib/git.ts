import { getEmptyProject } from '@/lib/utils'
import isoGit from 'isomorphic-git'
import { FsaNodeFs } from 'memfs/lib/fsa-to-node'
import { IDirent, TDataOut } from 'memfs/lib/node/types/misc'

export type GitFileStatus = keyof typeof GitFileStatus
export const GitFileStatus = {
	modified: 'modified',
	ignored: 'ignored',
	unmodified: 'unmodified',
	'*modified': '*modified',
	'*deleted': '*deleted',
	'*added': '*added',
	absent: 'absent',
	deleted: 'deleted',
	added: 'added',
	'*unmodified': '*unmodified',
	'*absent': '*absent',
	'*undeleted': '*undeleted',
	'*undeletemodified': '*undeletemodified',
} as const

const getFileStateChanges = (fs: FsaNodeFs) => async (commitHash1: string, dir: string) => {
	return isoGit.walk({
		fs,
		dir,
		trees: [isoGit.TREE({ ref: commitHash1 }), isoGit.TREE({ ref: 'HEAD' })],
		map: async function (filepath, [A, B]) {
			// ignore directories
			if (filepath === '.') {
				return
			}
			if ((await A?.type()) === 'tree' || (await B?.type()) === 'tree') {
				console.log('exit 2')
				return
			}

			console.log('map', filepath, [A, B])

			// generate ids
			const Aoid = await A?.oid()
			const Boid = await B?.oid()

			// determine modification type
			let type = 'equal'
			if (Aoid !== Boid) {
				type = 'modify'
			}
			if (Aoid === undefined) {
				type = 'add'
			}
			if (Boid === undefined) {
				type = 'remove'
			}
			if (Aoid === undefined && Boid === undefined) {
				console.log('Something weird happened:')
				console.log(A)
				console.log(B)
			}

			return {
				path: `/${filepath}`,
				type: type,
			}
		},
	})
}

const dir = ''

export const git = {
	init: (fs: FsaNodeFs) => async () => {
		try {
			await isoGit.init({ fs, dir, defaultBranch: 'main' })
			await fs.promises.writeFile('/project.json', JSON.stringify(getEmptyProject(), null, 4))
			await isoGit.add({ fs, dir: '', filepath: 'project.json' })
			await isoGit.commit({
				fs,
				dir,
				author: { name: 'Kaizen', email: 'nick@applicable.co.nz' },
				message: 'initial commit',
			})
		} catch (error) {
			console.log(error)
		}
	},
	branch: (fs: FsaNodeFs) => async (ref: string) => {
		try {
			await isoGit.branch({ fs, dir, ref, checkout: true })
		} catch (error) {
			console.log(error)
		}
	},
	checkout: (fs: FsaNodeFs) => async (ref: string) => {
		try {
			const files = (await fs.promises.readdir('')).filter((x: TDataOut | IDirent) => x !== '.git')
			for (const path of files) {
				await fs.promises.unlink(path as string)
			}
			await isoGit.checkout({ fs, dir, ref, force: true })
		} catch (error) {
			console.dir(error)
		}
	},
	add: (fs: FsaNodeFs) => async (filepath: string) => {
		try {
			return await isoGit.add({ fs, dir, filepath })
		} catch (error) {
			console.log(error)
		}
	},
	remove: (fs: FsaNodeFs) => async (filepath: string) => {
		try {
			return await isoGit.remove({ fs, dir, filepath })
		} catch (error) {
			console.log(error)
		}
	},
	commit: (fs: FsaNodeFs) => async (message: string) => {
		try {
			return await isoGit.commit({ fs, dir, message })
		} catch (error) {
			console.log(error)
		}
	},
	status: (fs: FsaNodeFs) => async (filepath: string) => {
		try {
			return await isoGit.status({ fs, dir, filepath })
		} catch (error) {
			console.log(error)
		}
	},
	log: (fs: FsaNodeFs) => async () => {
		try {
			return await isoGit.log({ fs, dir })
		} catch (error) {
			console.log(error)
		}
	},
	readCommit: (fs: FsaNodeFs) => async (oid: string, filepath: string) => {
		try {
			return await isoGit.readObject({ fs, dir, oid, filepath })
		} catch (error) {
			console.log(error)
		}
	},
	diff: (fs: FsaNodeFs) => (commitHash: string) => {
		return getFileStateChanges(fs)(commitHash, dir)
	},
	getFileHead: (fs: FsaNodeFs) => async (filepath: string) => {
		const head = await isoGit.resolveRef({ fs, dir, ref: 'HEAD' })
		const obj = await isoGit.readObject({ fs, dir, oid: head, filepath })

		return new TextDecoder().decode(obj.object as Uint8Array)
	},
	thing: (fs: FsaNodeFs) => async () => {
		const files = await isoGit.listFiles({ fs, dir, ref: 'HEAD' })

		return files
	},
}

export type GitInstance = ReturnType<typeof createGitInstance>
export const createGitInstance = (fs: FsaNodeFs) => {
	return {
		init: git.init(fs),
		branch: git.branch(fs),
		checkout: git.checkout(fs),
		add: git.add(fs),
		remove: git.remove(fs),
		commit: git.commit(fs),
		status: git.status(fs),
		log: git.log(fs),
		diff: git.diff(fs),
		readCommit: git.readCommit(fs),
		getFileHead: git.getFileHead(fs),
		thing: git.thing(fs),
	}
}
