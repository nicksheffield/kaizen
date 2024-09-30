import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp } from '@/lib/AppContext'
import { camelize, uc } from '@/lib/utils'
import { MailPlusIcon, PlusIcon } from 'lucide-react'
import { MODS_PATH } from '@/lib/constants'
import emailTemplate from '@/templates/email-template'

export const AddFileMenu = () => {
	const saveFile = useApp((v) => v.saveFile)
	const openFile = useApp((v) => v.openFile)
	const project = useApp((v) => v.project)

	if (!project) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="pip-icon" className="hover:bg-foreground/10">
					<PlusIcon className="w-4 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent side="right" align="start">
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
