import { ProjectHeader } from '@/components/ProjectHeader'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'

export const Header = () => {
	return (
		<div className="relative grid grid-cols-[auto,1fr,auto] gap-4 overflow-hidden p-4">
			<div className="flex items-center">
				{/* <Logo /> */}
				<div className="group origin-left cursor-default text-2xl font-black tracking-tight transition-transform hover:scale-125">
					<span className="transition-colors group-hover:text-indigo-500">K</span>
					<span className="transition-colors group-hover:text-purple-500">a</span>
					<span className="transition-colors group-hover:text-red-500">i</span>
					<span className="transition-colors group-hover:text-orange-500">z</span>
					<span className="transition-colors group-hover:text-yellow-500">e</span>
					<span className="transition-colors group-hover:text-green-500">n</span>
				</div>
			</div>
			<div className="flex w-full items-center justify-center">
				<ProjectHeader />
			</div>
			<div className="flex items-center justify-end gap-4">
				<Button variant="link" asChild>
					<a href="https://docs.kz-app.com" target="_blank" rel="noreferrer">
						Docs
					</a>
				</Button>

				<UserMenu />
			</div>
		</div>
	)
}
