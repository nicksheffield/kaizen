import { ProjectHeader } from '@/components/ProjectHeader'
import { UserMenu } from '@/components/UserMenu'

export const Header = () => {
	return (
		<div className="relative flex items-center justify-between overflow-hidden p-4">
			<div className="">
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
			<div className="flex items-center gap-4">
				<UserMenu />
			</div>
			<div className="pointer-events-none absolute left-0 top-0 flex w-full items-center justify-center p-4">
				<ProjectHeader />
			</div>
		</div>
	)
}
