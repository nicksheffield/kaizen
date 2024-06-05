import { ProjectHeader } from '@/components/ProjectHeader'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'

export const Header = () => {
	return (
		<div className="relative grid grid-cols-[1fr,1fr,1fr] gap-4 overflow-hidden bg-muted p-4">
			<div className="flex items-center">
				{/* <Logo /> */}
				<div className="group origin-left cursor-default text-2xl font-black tracking-tight transition-transform hover:scale-125 hover:italic">
					<span className="transition-colors group-hover:text-primary/90">K</span>
					<span className="transition-colors group-hover:text-primary/80">a</span>
					<span className="transition-colors group-hover:text-primary/70">i</span>
					<span className="transition-colors group-hover:text-primary/60">z</span>
					<span className="transition-colors group-hover:text-primary/50">e</span>
					<span className="transition-colors group-hover:text-primary/40">n</span>
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
