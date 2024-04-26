import { type ElementType, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	CalendarIcon,
	CheckIcon,
	ClockIcon,
	FileIcon,
	FingerprintIcon,
	HashIcon,
	HelpCircleIcon,
	KeyIcon,
	LockIcon,
	PlusIcon,
	TextIcon,
	Trash2Icon,
	XIcon,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Attribute, Model as BasicModel, AttributeType } from '@/lib/projectSchemas'
import { PanelRow } from './PanelRow'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, getIsUserAttr } from '@/lib/utils'
import { useERDContext } from '@/lib/ERDContext'
import { getLogicalRecommend, getSourceName, getTargetName, isReservedKeyword } from '@/lib/ERDHelpers'
import { useAttrField } from '@/lib/useAttrField'

type Model = BasicModel & {
	attributes: Attribute[]
}

type AttributeRowProps = {
	attr: Attribute
	model: Model
	remove: () => void
	updateField: (field: keyof Attribute, value: Attribute[typeof field]) => void
}

// const zoomSelector = (s: ReactFlowState) => s.transform[2]

export const AttributeRow = ({ attr, model, remove, updateField }: AttributeRowProps) => {
	const { relations, nodes, attrTypeRecommends } = useERDContext()

	const isUserAttr = getIsUserAttr(attr.id)
	const isLocked = isUserAttr || attr.name === 'id'

	const AttrIcon: ElementType = useMemo(() => {
		switch (attr.type) {
			case AttributeType.id:
				return FingerprintIcon
			case AttributeType.a_i:
				return PlusIcon
			case AttributeType.varchar:
			case AttributeType.text:
				return TextIcon
			case AttributeType.base64:
				return FileIcon
			case AttributeType.password:
				return KeyIcon
			case AttributeType.int:
			case AttributeType.float:
				return HashIcon
			case AttributeType.boolean:
				return CheckIcon
			case AttributeType.datetime:
			case AttributeType.date:
				return CalendarIcon
			case AttributeType.time:
				return ClockIcon
			default:
				return HelpCircleIcon
		}
	}, [attr.type])

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: attr.id })

	const [name, setName] = useAttrField(attr.modelId, attr.id, 'name')
	const [, setType] = useAttrField(attr.modelId, attr.id, 'type')
	const [def, setDef] = useAttrField(attr.modelId, attr.id, 'default')

	const nameConflicted =
		model.attributes.some((a) => a.name === attr.name && a.id !== attr.id) ||
		relations.some((x) => {
			if (attr.modelId === x.sourceId) {
				if (attr.name === getTargetName(x, nodes)) return true
			}

			if (attr.modelId === x.targetId) {
				if (attr.name === getSourceName(x, nodes)) return true
			}

			return false
		}) ||
		isReservedKeyword(attr.name)

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const [open, setOpen] = useState(false)

	// const zoom = useStore(zoomSelector)
	// const showContent = zoom > 0.5
	const showContent = true
	if (!showContent) {
		return (
			<div className="h-[24px] p-1">
				<div className="h-full rounded-md bg-gray-100"></div>
			</div>
		)
	}

	return (
		<div key={attr.id} className="relative flex flex-col px-2" ref={setNodeRef} style={style}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="xs"
						className={cn(
							'flex h-[24px] items-center justify-between gap-6 px-1 py-0',
							open && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
						)}
					>
						<div className="flex items-center gap-2">
							<AttrIcon
								className={cn(
									'h-4 w-4 cursor-grab opacity-25 active:cursor-grabbing',
									open && 'opacity-75'
								)}
								{...(attr.name !== 'id' ? { ...attributes, ...listeners } : {})}
							/>
							{attr.name ? (
								<div
									className={cn(
										'text-xs',
										nameConflicted && 'text-destructive',
										!attr.enabled && 'text-muted-foreground'
									)}
								>{`${attr.name}${attr.nullable ? '?' : ''}`}</div>
							) : (
								<div
									className={cn('text-xs italic text-destructive', open && 'text-primary-foreground')}
								>
									New Field
								</div>
							)}
						</div>
						<div className={cn('translate-y-px font-mono text-xs opacity-50', open && 'opacity-100')}>
							{attr.type}
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent align="center" side="right">
					<div className="grid auto-rows-fr grid-cols-1">
						<div className="flex items-center justify-between pb-3">
							<div>Field Settings</div>
							{!isLocked && (
								<Button variant="ghost" size="xs" onClick={remove}>
									<Trash2Icon className="h-4 w-4" />
								</Button>
							)}
						</div>

						{isUserAttr && (
							<div className="mb-1 flex items-center justify-center rounded-md bg-muted p-2 text-sm text-muted-foreground">
								This is an Auth field.
							</div>
						)}

						{attr.name === 'id' ? (
							<>
								<PanelRow label="Type">
									<Select value={attr.type} onValueChange={(val) => updateField('type', val)}>
										<SelectTrigger className="h-8 px-2 py-1 text-sm">
											<SelectValue placeholder="Type" />
										</SelectTrigger>

										<SelectContent position="item-aligned">
											<SelectItem value="id">ID</SelectItem>
											<SelectItem value="a_i">Auto-Increment</SelectItem>
										</SelectContent>
									</Select>
								</PanelRow>
							</>
						) : (
							<>
								<PanelRow label="Name">
									<Input
										value={name || ''}
										size="sm"
										onChange={(e) => {
											const val = e.currentTarget.value.replace(/\s/g, '')
											setName(val)
											const recommend = attrTypeRecommends.find((x) => x.name === val)

											if (recommend) {
												setType(recommend.recommendedType as AttributeType)
											}

											const logicalRecommend = getLogicalRecommend(val)

											if (logicalRecommend) {
												setType(logicalRecommend)
											}
										}}
										autoFocus
										disabled={isLocked}
									/>
								</PanelRow>

								<PanelRow label="Type">
									<Select value={attr.type} onValueChange={(val) => setType(val)} disabled={isLocked}>
										<SelectTrigger className="h-8 px-2 py-1 text-sm">
											<SelectValue placeholder="Type" />
										</SelectTrigger>

										<SelectContent position="item-aligned">
											{/* <SelectItem value="cuid">CUID</SelectItem> */}
											{Object.entries(AttributeType).map(([key, value]) => {
												return (
													<SelectItem key={key} value={value}>
														{key}
													</SelectItem>
												)
											})}
										</SelectContent>
									</Select>
								</PanelRow>

								<PanelRow label="Default">
									{attr.type === 'id' || attr.type === 'datetime' || attr.type === 'boolean' ? (
										<div className="relative w-full">
											<Select
												value={def || ''}
												onValueChange={(val) => setDef(val === '' ? null : val)}
												disabled={isLocked}
											>
												<SelectTrigger className="h-8 px-2 py-1 text-sm">
													<SelectValue />
												</SelectTrigger>

												<SelectContent position="item-aligned">
													{/* <SelectItem value="">None</SelectItem> */}
													{attr.nullable && <SelectItem value="null">NULL</SelectItem>}
													{attr.type === 'datetime' && (
														<SelectItem value="CURRENT_TIMESTAMP">
															CURRENT_TIMESTAMP
														</SelectItem>
													)}
													{attr.type === 'boolean' && (
														<>
															<SelectItem value="true">TRUE</SelectItem>
															<SelectItem value="false">FALSE</SelectItem>
														</>
													)}
												</SelectContent>
											</Select>
											<div className="absolute right-0 top-0 mr-6 flex h-full translate-x-px items-center">
												<Button
													size="pip-icon"
													variant="outline"
													className="h-5 w-5 border-0"
													onClick={() => {
														setDef('')
													}}
												>
													<XIcon className="w-3" />
												</Button>
											</div>
										</div>
									) : (
										<Input
											value={attr.default || ''}
											onChange={(e) => updateField('default', e.currentTarget.value)}
											disabled={isLocked}
											size="sm"
										/>
									)}
								</PanelRow>

								<PanelRow label="Nullable">
									<Switch
										checked={attr.nullable}
										onCheckedChange={(val) => updateField('nullable', val)}
										disabled={isLocked}
									/>
								</PanelRow>

								<PanelRow label="Selectable">
									<Switch
										checked={attr.selectable}
										onCheckedChange={(val) => updateField('selectable', val)}
										disabled={isLocked}
									/>
								</PanelRow>

								<PanelRow label="Insertable">
									<Switch
										checked={attr.insertable}
										onCheckedChange={(val) => updateField('insertable', val)}
										disabled={isLocked}
									/>
								</PanelRow>

								<PanelRow
									label="Enabled"
									hint="If set to false, this field will be omitted from the generated app and db schema"
								>
									<Switch
										checked={attr.enabled}
										onCheckedChange={(val) => updateField('enabled', val)}
										disabled={isLocked}
									/>
								</PanelRow>
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>

			{/* {attr.name === 'id' && <Handle type="target" position={Position.Left} id={attr.id} />} */}
		</div>
	)
}
