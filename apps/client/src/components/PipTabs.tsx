import { Button } from './ui/button'

type PipTabsProps<T extends string> = {
	value: T
	onValueChange: (val: T) => void
	items: Record<T, string>
}

export const PipTabs = <T extends string>({
	value,
	onValueChange,
	items,
}: PipTabsProps<T>) => {
	return (
		<>
			{Object.keys(items).map((key) => (
				<Button
					key={key}
					variant={value === key ? 'pip-selected' : 'pip'}
					size="pip"
					onClick={() => onValueChange(key as T)}
				>
					{items[key as T]}
				</Button>
			))}
		</>
	)
}
