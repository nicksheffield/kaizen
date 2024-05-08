import { useApp } from '@/lib/AppContext'

export const Welcome = () => {
	const root = useApp((v) => v.root)

	return (
		<div className="h-full p-8">
			<div className="flex h-full items-center justify-center rounded-3xl border-4 border-dashed">
				<div className="select-none text-sm font-medium text-muted-foreground">
					{root && 'No file selected'}
				</div>
			</div>
		</div>
	)
}
