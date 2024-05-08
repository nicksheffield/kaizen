import { CollapsableSection } from '@/components/CollapsableSection'
import { Tree } from '@/components/Tree'
import { TreeFileIcon } from '@/components/TreeFileIcon'
import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useApp } from '@/lib/AppContext'
import { MODS_PATH } from '@/lib/constants'
import { isFile } from '@/lib/handle'
import { camelize, cn, uc } from '@/lib/utils'
import emailTemplate from '@/templates/email-template'
import { PlusIcon } from 'lucide-react'

export const ProjectTree = () => {
	const root = useApp((v) => v.root)
	const files = useApp((v) => v.files)
	const project = useApp((v) => v.project)
	const saveFile = useApp((v) => v.saveFile)
	const openFile = useApp((v) => v.openFile)
	const selectedPath = useApp((v) => v.selectedPath)

	const seedFilePath = `${MODS_PATH}/src/seed.ts`

	const emailFiles = files.filter(isFile).filter((x) => x.path.startsWith(`${MODS_PATH}/emails`))
	const firstLevelDescs = files.filter((x) => x.path !== root?.path).filter((x) => !x.path.includes('/'))

	if (!project) return null

	return (
		<div className="flex flex-col gap-2">
			<div className="p-2 pt-6">
				<CollapsableSection title="Project" localStorageKey="sidebar-project-open">
					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === 'project.json?models'
								? 'bg-primary/10 text-primary hover:bg-primary/20'
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
								? 'bg-primary/10 text-primary hover:bg-primary/20'
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
								? 'bg-primary/10 text-primary hover:bg-primary/20'
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
								? 'bg-primary/10 text-primary hover:bg-primary/20'
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
					title="Customisation"
					localStorageKey="sidebar-customisation-open"
					button={
						<Button
							variant="ghost"
							size="pip-icon"
							onClick={() => {
								openPrompt({
									title: 'Email name',
									description: 'No spaces, PascalCase, no special characters',
									placeholder: 'eg, ConfirmAccount',
									onSubmit: async (name) => {
										const fixedName = uc(camelize(name))
										await saveFile(
											`${MODS_PATH}/emails/${fixedName}.tsx`,
											emailTemplate({ name: fixedName, project })
										)
										openFile(`${MODS_PATH}/emails/${fixedName}.tsx`)
									},
								})
							}}
						>
							<PlusIcon className="w-4" />
						</Button>
					}
				>
					<div
						className={cn(
							'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm',
							selectedPath === seedFilePath
								? 'bg-primary/10 text-primary hover:bg-primary/20'
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
									? 'bg-primary/10 text-primary hover:bg-primary/20'
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
