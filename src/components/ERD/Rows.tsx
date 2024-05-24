import { PropsWithChildren } from 'react'

export const Row = ({ children }: PropsWithChildren<{}>) => {
	return (
		<label className="flex h-10 flex-row items-center justify-between pl-3 transition-colors has-[:focus]:bg-muted/50 dark:has-[:focus]:bg-foreground/5">
			{children}
		</label>
	)
}

export const RowLabel = ({ children }: PropsWithChildren<{}>) => {
	return <div className="text-sm font-medium text-muted-foreground">{children}</div>
}

export const RowGap = () => {
	return (
		<div className="pointer-events-none hidden h-4 bg-muted/50 shadow-[inset_0px_6px_5px_-5px_rgba(0,0,0,0.2)]" />
	)
}
