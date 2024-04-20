import { Ripples } from './Ripples'

export const Logo = () => (
	<div className="group relative">
		<div className="flex h-8 w-8 select-none items-center rounded-md bg-muted px-2 text-2xl font-bold text-foreground transition-colors hover:bg-primary hover:text-light">
			K
		</div>
		<div className="pointer-events-none absolute left-0 top-0 -z-[1] translate-x-[-47.6%] translate-y-[-47.6%]">
			<Ripples />
		</div>
	</div>
)
