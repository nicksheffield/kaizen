import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../lib/AppContext'
import { TreeFileIcon } from './TreeFileIcon'
import { FSDesc, isDir, isFile } from '@/lib/handle'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { AlertOctagonIcon, Trash2Icon } from 'lucide-react'
import { openConfirm } from '@/components/Alert'
import { cn } from '@/lib/utils'

type TreeProps = {
	path: string
	level?: number
}

export const Tree = ({ path, level = 0 }: TreeProps) => {
	const files = useApp((v) => v.files)
	const selectedPath = useApp((v) => v.selectedPath)
	const openFile = useApp((v) => v.openFile)
	const dirOpenStatus = useApp((v) => v.dirOpenStatus)
	const setDirOpenStatus = useApp((v) => v.setDirOpenStatus)
	const deleteFile = useApp((v) => v.deleteFile)

	// if (path === '.git') return null

	const open = !!dirOpenStatus[path]
	const toggleOpen = () => {
		setDirOpenStatus((y) => ({ ...y, [path]: !y[path] }))
	}

	const file = files.find((x) => x.path === path)
	const children = files
		.filter((x) => x.path !== path)
		.filter((x) => x.path.split('/').slice(0, -1).join('/') === path)

	if (!file) return null

	return (
		<div className="flex flex-col">
			<DescRow
				file={file}
				isSelected={selectedPath === path}
				onSelect={() => {
					if (isFile(file)) {
						openFile(file.path)
					} else {
						toggleOpen()
					}
				}}
				onDelete={async () => {
					await deleteFile(file.path)
				}}
				level={level}
				isOpen={open}
			/>
			{isDir(file) && (
				<AnimatePresence initial={false}>
					{open && (
						<motion.div
							initial={{ height: 0 }}
							exit={{ height: 0 }}
							animate={{ height: 'auto' }}
							className="overflow-hidden"
						>
							{children.map((file) => (
								<div key={file.path}>
									<Tree path={file.path} level={level + 1} />
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
	)
}

type DescRowProps = {
	file: FSDesc
	isSelected: boolean
	onSelect: () => Promise<void> | void
	onDelete: () => Promise<void> | void
	level?: number
	isOpen: boolean
}

const DescRow = ({ file, isSelected, onSelect, onDelete, level = 1, isOpen }: DescRowProps) => {
	const buildErrorPaths = useApp((v) => v.buildErrorPaths)

	const hasError = buildErrorPaths.indexOf(file.path) !== -1

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={cn(
						'flex cursor-pointer items-center gap-2 rounded-md py-1',
						isSelected ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-foreground/10',
						hasError && 'text-destructive',
						isSelected && hasError && 'bg-destructive text-primary-foreground hover:bg-destructive/80'
					)}
					onClick={(e) => {
						e.stopPropagation()
						onSelect()
					}}
					style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
				>
					{hasError ? <AlertOctagonIcon className="w-4" /> : <TreeFileIcon path={file.path} open={isOpen} />}

					<div className="select-none truncate text-sm">{file.name}</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
					onClick={() => {
						openConfirm({
							title: 'Delete file?',
							variant: 'destructive',
							onSubmit: async () => {
								await onDelete()
							},
						})
					}}
				>
					<Trash2Icon className="mr-2 w-4" />
					Delete {isFile(file) ? 'File' : 'Directory'}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
