import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useApp } from '@/lib/AppContext'
import { getEmptyProject, camelize, uc } from '@/lib/utils'
import { Link2Icon, MailPlusIcon, PlusCircleIcon, PlusSquareIcon, SproutIcon } from 'lucide-react'
import emailTemplate from '@/templates/email-template'

export const AddFileMenu = () => {
	const files = useApp((v) => v.files)
	const saveFile = useApp((v) => v.saveFile)
	const openPath = useApp((v) => v.openPath)
	const project = useApp((v) => v.project)

	const seeder = files.find((x) => x.path === 'config/seed.ts')

	const projectJson = files.find((x) => x.path === 'project.json')

	if (!project || !projectJson) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="pip-icon"
						onClick={() => {
							saveFile('project.json', JSON.stringify(getEmptyProject(), null, 4))
						}}
					>
						<PlusCircleIcon className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Create Project</TooltipContent>
			</Tooltip>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="pip-icon">
					<PlusSquareIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem
					onClick={() => {
						openPrompt({
							title: 'Endpoint path',
							onSubmit: async (val) => {
								let path = val

								if (val.startsWith('/')) path = path.slice(1)
								if (val.startsWith('api/')) path = path.slice(4)

								await saveFile(`kaizen/api/${path}.json`, '{}')
								openPath(`kaizen/api/${path}.json`)
							},
						})
					}}
				>
					<Link2Icon className="mr-2 w-4" />
					<div>Add Endpoint</div>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						openPrompt({
							title: 'Email name',
							onSubmit: async (name) => {
								const fixedName = uc(camelize(name))
								await saveFile(
									`kaizen/emails/${fixedName}.tsx`,
									emailTemplate({ name: fixedName, project })
								)
								openPath(`kaizen/emails/${fixedName}.tsx`)
							},
						})
					}}
				>
					<MailPlusIcon className="mr-2 w-4" />
					<div>Add Email</div>
				</DropdownMenuItem>
				{!seeder && (
					<DropdownMenuItem
						onClick={() => {
							saveFile(
								'kaizen/seed.ts',
								`import { db } from '@/lib/db.js'
import { eq, lt } from 'drizzle-orm'
import * as tables from '@/schema.js'
import { generateId } from 'lucia'
import { Argon2id } from 'oslo/password'

export default async () => {
	// create admin user if it doesn't exist
	const adminUser = await db.query.users.findFirst({
		where: eq(tables.users.email, 'admin@example.com'),
	})

	if (!adminUser) {
		await db.insert(tables.users).values({
			id: generateId(15),
			email: 'admin@example.com',
			password: await new Argon2id().hash('password'),
			roles: 'default|admin',
		})
	}
}`
							)
							openPath(`kaizen/seed.ts`)
						}}
					>
						<SproutIcon className="mr-2 w-4" />
						<div>Add Seeder</div>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
