import { Moon, PaletteIcon, Sun, UserIcon } from 'lucide-react'

import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useTheme } from '../lib/ThemeContext'
import { useAppTheme } from '@/lib/AppThemeContext'

export function UserMenu() {
	const { theme, setTheme } = useTheme()

	const { appTheme, setAppTheme } = useAppTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="test" size="icon">
					<UserIcon className="w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="bottom" align="end">
				<DropdownMenuSub>
					<DropdownMenuSubTrigger noIcon>
						<PaletteIcon className="h-4 w-4 scale-100 opacity-80" />
						<span className="ml-2">Color Theme</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuCheckboxItem onClick={() => setAppTheme('gray')} checked={appTheme === 'gray'}>
							Slate
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem onClick={() => setAppTheme('blue')} checked={appTheme === 'blue'}>
							Blue
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem onClick={() => setAppTheme('rose')} checked={appTheme === 'rose'}>
							Rose
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem onClick={() => setAppTheme('orange')} checked={appTheme === 'orange'}>
							Orange
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem onClick={() => setAppTheme('green')} checked={appTheme === 'green'}>
							Green
						</DropdownMenuCheckboxItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger noIcon>
						<Sun className="h-4 w-4 rotate-0 scale-100 opacity-80 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-4 w-4 rotate-90 scale-0 opacity-80 transition-all dark:rotate-0 dark:scale-100" />
						<span className="ml-2">Theme</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuCheckboxItem onClick={() => setTheme('light')} checked={theme === 'light'}>
							Light
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem onClick={() => setTheme('dark')} checked={theme === 'dark'}>
							Dark
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem onClick={() => setTheme('system')} checked={theme === 'system'}>
							System
						</DropdownMenuCheckboxItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
