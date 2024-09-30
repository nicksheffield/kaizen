import {
	BoxIcon,
	FileIcon,
	FileJson2Icon,
	FolderCogIcon,
	FolderGit2Icon,
	FolderIcon,
	FolderOpenIcon,
	FolderRootIcon,
	HelpCircleIcon,
	MailIcon,
	SproutIcon,
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
