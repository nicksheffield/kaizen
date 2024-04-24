import { GitBranchIcon, GitForkIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { openPrompt } from '@/components/modals/openPrompt'

export const GitControls = () => {
	const head = useApp((v) => v.head)
	const localBranches = useApp((v) => v.localBranches)
	const remoteBranches = useApp((v) => v.remoteBranches)
	const root = useApp((v) => v.root)
	const files = useApp((v) => v.files)
	const git = useApp((v) => v.git)

	if (!root && !files.find((x) => x.path === '.git')) return

	return (
		<div className="flex flex-col divide-y">
			<div className="flex h-10 shrink-0 items-center justify-between pl-2 pr-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="pip" className="flex items-center gap-2 px-2">
							<GitForkIcon className="h-4 w-4 text-indigo-600" />
							{head}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start">
						<DropdownMenuGroup title="Local">
							<DropdownMenuLabel className="opacity-50">Local</DropdownMenuLabel>
							{localBranches.map((x) => (
								<DropdownMenuCheckboxItem
									key={x}
									checked={x === head}
									onClick={() => {
										if (git) {
											console.log('checkout', x)
											// git.checkout(x)
										} else {
											console.log('no fs')
										}
									}}
								>
									{x}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuItem
								onClick={() => {
									openPrompt({
										title: 'Branch Name',
										onSubmit: async (val) => {
											if (git) await git.branch(val)
										},
									})
								}}
							>
								<GitBranchIcon className="mr-2 h-4 w-4" />
								New Branch
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuGroup title="Remote">
							<DropdownMenuLabel className="opacity-50">Remote</DropdownMenuLabel>
							{remoteBranches.map((x) => (
								<DropdownMenuCheckboxItem key={x} checked={x === head}>
									{x}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
