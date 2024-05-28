import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from '@/components/ui/command'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { EclipseIcon, MoonIcon, OrbitIcon, SunIcon } from 'lucide-react'

export function CommandMenu() {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')

	const close = useCallback(() => {
		setOpen(false)
		setSearch('')
	}, [])

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}
		document.addEventListener('keydown', down)
		return () => document.removeEventListener('keydown', down)
	}, [])

	const { resolvedTheme, setTheme } = useTheme()
	const themeActions = useMemo(() => {
		return [
			{
				label: 'Toggle Dark Mode',
				onClick: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
				icon: EclipseIcon,
			},
			{ label: 'Dark', onClick: () => setTheme('dark'), icon: MoonIcon },
			{ label: 'Light', onClick: () => setTheme('light'), icon: SunIcon },
			{ label: 'System', onClick: () => setTheme('system'), icon: OrbitIcon },
		]
	}, [setTheme])

	return (
		<CommandDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (isOpen) {
					setOpen(true)
				} else {
					close()
				}
			}}
		>
			<CommandInput placeholder="Type a command or search..." value={search} onValueChange={setSearch} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Theme">
					{themeActions.map((item) => (
						<CommandItem
							key={item.label}
							onSelect={() => {
								close()
								item.onClick()
							}}
							className="p-4"
						>
							<item.icon className="mr-3 !w-4 text-muted-foreground" />
							{item.label}
							<CommandShortcut>Theme</CommandShortcut>
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	)
}
