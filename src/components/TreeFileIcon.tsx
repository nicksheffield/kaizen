import {
	BoxIcon,
	FileIcon,
	FileJson2Icon,
	FingerprintIcon,
	FolderCogIcon,
	FolderGit2Icon,
	FolderIcon,
	FolderOpenIcon,
	FolderRootIcon,
	HelpCircleIcon,
	MailIcon,
	BoltIcon,
	SproutIcon,
	DatabaseIcon,
	TentTreeIcon,
	DraftingCompassIcon,
	TelescopeIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/AppContext'
import { MODS_PATH } from '@/lib/constants'

type TreeFileIconProps = {
	path?: string
	open?: boolean
	className?: string
}

export const TreeFileIcon = ({ path, open = true, className }: TreeFileIconProps) => {
	const files = useApp((v) => v.files)

	const file = files.find((x) => x.path === path)

	const classNames = cn('w-4 h-4 shrink-0', className)

	switch (file?.name) {
		case '.git':
			return <FolderGit2Icon className={classNames} />
		case '.vscode':
			return <FolderCogIcon className={classNames} />
	}

	if (file?.path === '') {
		return <FolderRootIcon className={classNames} />
	}

	if (file?.type === 'directory') {
		if (open) {
			return <FolderOpenIcon className={classNames} />
		}
		return <FolderIcon className={classNames} />
	}

	if (path === 'project.json?models') {
		return <DatabaseIcon className={classNames} />
	}

	if (path === 'project.json?details') {
		return <BoltIcon className={classNames} />
	}

	if (path === 'project.json?auth') {
		return <FingerprintIcon className={classNames} />
	}

	if (path === 'project.json?sandbox') {
		return <TelescopeIcon className={classNames} />
	}

	if (path === 'project.json?environment') {
		return <TentTreeIcon className={classNames} />
	}

	if (path === 'project.json?helpers') {
		return <DraftingCompassIcon className={classNames} />
	}

	if (file?.type === 'file') {
		// if (file?.name === 'project.json') {
		// 	return <ActivityIcon className={classNames} />
		// }

		if (file?.path === `${MODS_PATH}/src/seed.ts`) {
			return <SproutIcon className={classNames} />
		}

		if (file.path.startsWith(`${MODS_PATH}/emails`)) {
			return <MailIcon className={classNames} />
		}

		if (file.path.startsWith(`${MODS_PATH}/api`)) {
			return <BoxIcon className={classNames} />
		}

		const fileType = file?.name.split('.').pop()

		if (fileType === 'json') {
			return <FileJson2Icon className={classNames} />
		}

		return <FileIcon className={classNames} />
	}

	return <HelpCircleIcon className={classNames} />
}
