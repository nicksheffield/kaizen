import { AddFileMenu } from '@/components/AddFileMenu'
import { CollapsableSection } from '@/components/CollapsableSection'
import { Tree } from '@/components/Tree'
import { TreeFileIcon } from '@/components/TreeFileIcon'
import { Separator } from '@/components/ui/separator'
import { useApp } from '@/lib/AppContext'
import { MODS_PATH } from '@/lib/constants'
import { isFile } from '@/lib/handle'
import { cn } from '@/lib/utils'

export const ProjectTree = () => {
	const root = useApp((v) => v.root)
	const files = useApp((v) => v.files)
	const openFile = useApp((v) => v.openFile)
	const selectedPath = useApp((v) => v.selectedPath)

	const seedFilePath = `${MODS_PATH}/src/seed.ts`

	const emailFiles = files.filter(isFile).filter((x) => x.path.startsWith(`${MODS_PATH}/emails`))
	const apiFiles = files.filter(isFile).filter((x) => x.path.startsWith(`${MODS_PATH}/api`))
	const firstLevelDescs = files.filter((x) => x.path !== root?.path).filter((x) => !x.path.includes('/'))

	return (
		<div className="flex flex-col gap-2">
			<div className="p-2 pt-6">
				<CollapsableSection title="Project" localStorageKey="sidebar-project-open">
					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === 'project.json?models'
								? 'bg-primary text-primary-foreground hover:bg-primary/80'
								: 'hover:bg-foreground/10'
						)}
						onClick={() => {
							openFile('project.json?models')
						}}
					>
						<TreeFileIcon path={'project.json?models'} className="opacity-50" />
						Models
					</div>

					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === 'project.json?details'
								? 'bg-primary text-primary-foreground hover:bg-primary/80'
								: 'hover:bg-foreground/10'
						)}
						onClick={() => {
							openFile('project.json?details')
						}}
					>
						<TreeFileIcon path={'project.json?details'} className="opacity-50" />
						Details
					</div>

					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === 'project.json?auth'
								? 'bg-primary text-primary-foreground hover:bg-primary/80'
								: 'hover:bg-foreground/10'
						)}
						onClick={() => {
							openFile('project.json?auth')
						}}
					>
						<TreeFileIcon path={'project.json?auth'} className="opacity-50" />
						Auth
					</div>

					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === 'project.json?environment'
								? 'bg-primary text-primary-foreground hover:bg-primary/80'
								: 'hover:bg-foreground/10'
						)}
						onClick={() => {
							openFile('project.json?environment')
						}}
					>
						<TreeFileIcon path={'project.json?environment'} className="opacity-50" />
						Environment
					</div>
				</CollapsableSection>
			</div>

			<Separator />

			<div className="p-2">
				<CollapsableSection
					title="Modifications"
					localStorageKey="sidebar-customisation-open"
					button={<AddFileMenu />}
				>
					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === seedFilePath
								? 'bg-primary text-primary-foreground hover:bg-primary/80'
								: 'hover:bg-foreground/10'
						)}
						onClick={() => {
							openFile(seedFilePath)
						}}
					>
						<TreeFileIcon path={seedFilePath} className="opacity-50" />
						seed.ts
					</div>
					{emailFiles.map((file) => (
						<div
							key={file.path}
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === file.path
									? 'bg-primary text-primary-foreground hover:bg-primary/80'
									: 'hover:bg-foreground/10'
							)}
							onClick={() => {
								openFile(file.path)
							}}
						>
							<TreeFileIcon path={file.path} className="opacity-50" />
							{file.name}
						</div>
					))}
					{apiFiles.map((file) => (
						<div
							key={file.path}
							className={cn(
								'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
								selectedPath === file.path
									? 'bg-primary text-primary-foreground hover:bg-primary/80'
									: 'hover:bg-foreground/10'
							)}
							onClick={() => {
								openFile(file.path)
							}}
						>
							<TreeFileIcon path={file.path} className="opacity-50" />
							{file.path.replace(`${MODS_PATH}/`, '').split('/').slice(0, -1).join('/')}
						</div>
					))}
				</CollapsableSection>
			</div>

			<Separator />

			<div className="p-2">
				<CollapsableSection title="Files" localStorageKey="sidebar-files-open">
					{firstLevelDescs.map((desc) => (
						<Tree key={desc.path} path={desc.path} />
					))}
				</CollapsableSection>
			</div>

			<Separator />
		</div>
	)
}
