import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp } from '@/lib/AppContext'
import { camelize, uc } from '@/lib/utils'
import { Link2Icon, MailPlusIcon, PlusSquareIcon } from 'lucide-react'
import emailTemplate from '@/templates/email-template'
import { MODS_PATH } from '@/lib/constants'

export const AddFileMenu = () => {
	const saveFile = useApp((v) => v.saveFile)
	const openFile = useApp((v) => v.openFile)
	const project = useApp((v) => v.project)

	if (!project) return null

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

								await saveFile(`${MODS_PATH}/api/${path}.json`, '{}')
								openFile(`${MODS_PATH}/api/${path}.json`)
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
									`${MODS_PATH}/emails/${fixedName}.tsx`,
									emailTemplate({ name: fixedName, project })
								)
								openFile(`${MODS_PATH}/emails/${fixedName}.tsx`)
							},
						})
					}}
				>
					<MailPlusIcon className="mr-2 w-4" />
					<div>Add Email</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
