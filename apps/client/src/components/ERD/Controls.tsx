import { useReactFlow } from '@xyflow/react'
import { AlertTriangleIcon, EyeIcon, PlusIcon, SaveIcon, SearchIcon, ShrinkIcon, Undo2Icon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useERDContext } from '@/lib/ERDContext'
import { useEffect, useState } from 'react'

export const Controls = () => {
	const {
		addNode,
		nodes,
		focusOn,
		detailed,
		setDetailed,
		showAuthAttributes,
		setShowAuthAttributes,
		showConnections,
		setShowConnections,
		showTypes,
		setShowTypes,
		isDirty,
		conflicts,
		reset,
		save,
	} = useERDContext()

	const flow = useReactFlow()

	const center = (zoom?: number) => {
		flow.fitView({ padding: 0.2, duration: 200 })
		if (zoom) flow.zoomTo(zoom)
	}

	const [showSearch, setShowSearch] = useState(false)

	useEffect(() => {
		const handle = (e: KeyboardEvent) => {
			// if cmd+f then open the search
			if (e.metaKey && e.key === 'f') {
				e.preventDefault()
				e.stopPropagation()
				setShowSearch(true)
			}
		}
		document.addEventListener('keydown', handle)
		return () => document.removeEventListener('keydown', handle)
	}, [])

	return (
		<>
			<div className="absolute left-2 top-2 z-10 flex flex-col gap-1 rounded-md border border-muted bg-background p-1">
				<Button variant="ghost" size="icon-sm" onClick={() => addNode()}>
					<PlusIcon className="h-4 w-4" />
				</Button>

				<Button variant="ghost" size="icon-sm" onClick={() => center()}>
					<ShrinkIcon className="h-4 w-4" />
				</Button>

				<Popover open={showSearch} onOpenChange={setShowSearch}>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon-sm">
							<SearchIcon className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent side="right" align="start" className="bg-popover p-0">
						<Command>
							<CommandInput placeholder="Search for models..." />
							<CommandList className="p-2">
								<CommandEmpty>No results found.</CommandEmpty>

								{nodes.map((x) => (
									<CommandItem
										key={x.id}
										onSelect={() => {
											focusOn(x)
											setShowSearch(false)
										}}
										className="px-3 py-2"
									>
										{x.data.name}
									</CommandItem>
								))}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon-sm">
							<EyeIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="right" align="start">
						<DropdownMenuLabel>View Options</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuCheckboxItem
							checked={detailed}
							onCheckedChange={setDetailed}
							onSelect={(e) => e.preventDefault()}
						>
							Show Common Fields
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={showAuthAttributes}
							onCheckedChange={setShowAuthAttributes}
							onSelect={(e) => e.preventDefault()}
						>
							Show Auth Fields
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={showConnections}
							onCheckedChange={setShowConnections}
							onSelect={(e) => e.preventDefault()}
						>
							Show Relationship Lines
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={showTypes}
							onCheckedChange={setShowTypes}
							onSelect={(e) => e.preventDefault()}
						>
							Show Types
						</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="absolute right-2 top-2 z-10 flex flex-row-reverse items-start gap-2">
				<div className="flex flex-col gap-1 rounded-md border border-muted bg-background p-1">
					<Button variant="ghost" size="icon-sm" className="flex items-center gap-2" onClick={save}>
						<SaveIcon className="h-4 w-4" />
					</Button>

					<Button
						variant="ghost"
						size="icon-sm"
						className="flex items-center gap-2"
						onClick={reset}
						disabled={!isDirty}
					>
						<Undo2Icon className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex flex-col items-end gap-2">
					{isDirty && (
						<div className="rounded-md bg-background p-2 text-sm font-medium">You have unsaved changes</div>
					)}

					{conflicts.length > 0 && (
						<div className="flex flex-col gap-2 rounded-md border border-muted bg-destructive p-2">
							{conflicts.map((message) => (
								<div
									className="flex items-center gap-2 text-sm font-medium text-destructive-foreground"
									key={message}
								>
									<div className="flex-1 text-right">{message}</div>
									<AlertTriangleIcon className="h-4 w-4" />
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	)
}
