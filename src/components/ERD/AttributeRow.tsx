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
	PlusIcon,
	TextIcon,
	Trash2Icon,
	UserIcon,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Attribute, Model as BasicModel, AttributeType } from '@/lib/projectSchemas'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, getIsUserAttr } from '@/lib/utils'
import { useERDContext } from '@/lib/ERDContext'
import { getLogicalRecommend, getSourceName, getTargetName, isReservedKeyword } from '@/lib/ERDHelpers'
import { useAttrField } from '@/lib/useAttrField'
import { SelectList } from '@/components/SelectList'
import { Row, RowLabel } from '@/components/ERD/Rows'

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
	const { relations, nodes, attrTypeRecommends, modalHasPopover, setModalHasPopover, detailed } = useERDContext()

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

	const [isPopoverOpen, setPopoverOpen] = useState(false)
	const onPopoverOpen = (val: boolean) => {
		setPopoverOpen(val)
		if (val) {
			setModalHasPopover(model.id)
		} else {
			setModalHasPopover(null)
		}
	}

	const isActiveModel = modalHasPopover === model.id
	const openPopover = isActiveModel && isPopoverOpen

	// const zoom = useStore(zoomSelector)
	// const showContent = zoom > 0.5
	const showContent = true
	if (!showContent) {
		return (
			<div className="h-[24px] p-1">
				<div className="h-full rounded-md bg-gray-100" />
			</div>
		)
	}

	if (isUserAttr && !detailed) return null

	return (
		<div key={attr.id} className="relative flex flex-col px-2" ref={setNodeRef} style={style}>
			<Popover open={openPopover} onOpenChange={onPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="xs"
						className={cn(
							'flex h-[24px] items-center justify-between gap-6 px-1 py-0 hover:bg-primary/20',
							isPopoverOpen &&
								'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
						)}
					>
						<div className="flex items-center gap-2">
							<AttrIcon
								className={cn(
									'h-4 w-4 cursor-grab opacity-25 active:cursor-grabbing',
									isPopoverOpen && 'opacity-75'
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
									className={cn(
										'text-xs italic text-destructive',
										isPopoverOpen && 'text-primary-foreground'
									)}
								>
									New Field
								</div>
							)}
						</div>
						<div
							className={cn(
								'translate-y-px font-mono text-xs opacity-50',
								isPopoverOpen && 'opacity-100'
							)}
						>
							{attr.type}
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					side="right"
					sideOffset={18}
					alignOffset={-56}
					className="p-0 dark:border-0 dark:highlight-white/10"
				>
					<div className="flex flex-col divide-y">
						<div className="flex h-10 items-center justify-between px-3 pr-2">
							<div className="text-sm font-medium">Field</div>
							{!isLocked && (
								<Button variant="ghost" size="xs" onClick={remove}>
									<Trash2Icon className="h-4 w-4 opacity-50" />
								</Button>
							)}
						</div>

						{/* <RowGap /> */}

						{isUserAttr && (
							<div className="flex h-10 items-center justify-start px-3 text-sm text-muted-foreground">
								<UserIcon className="mr-2 h-4 w-4" />
								This is an Auth field.
							</div>
						)}

						{attr.name === 'id' ? (
							<>
								<Row>
									<RowLabel>Type</RowLabel>
									<SelectList
										value={attr.type}
										onValueChange={(val) => updateField('type', val)}
										options={[
											{ label: 'ID', value: 'id' },
											{ label: 'Auto-Increment', value: 'a_i' },
										]}
										clearable={false}
										className="-my-2 flex-1 justify-end gap-2 border-0 bg-transparent pr-3 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>
							</>
						) : (
							<>
								<Row>
									<RowLabel>Name</RowLabel>
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
										className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>

								<Row>
									<RowLabel>Type</RowLabel>

									<SelectList
										value={attr.type}
										onValueChange={(val) => setType(val)}
										disabled={isLocked}
										options={Object.entries(AttributeType).map(([key, value]) => ({
											label: key,
											value,
										}))}
										clearable={false}
										className="-my-2 flex-1 justify-end gap-2 border-0 bg-transparent pr-3 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>

								<Row>
									<RowLabel>Default</RowLabel>

									{attr.type === 'id' || attr.type === 'datetime' || attr.type === 'boolean' ? (
										<>
											<SelectList
												value={def || ''}
												clearable={!!def && !isLocked}
												onValueChange={(val) => setDef(val === '' ? null : val)}
												disabled={isLocked}
												options={
													attr.nullable
														? [{ label: 'NULL', value: 'null' }]
														: attr.type === 'datetime'
															? [
																	{
																		label: 'CURRENT_TIMESTAMP',
																		value: 'CURRENT_TIMESTAMP',
																	},
																]
															: attr.type === 'boolean'
																? [
																		{ label: 'TRUE', value: 'true' },
																		{ label: 'FALSE', value: 'false' },
																	]
																: []
												}
												className="-my-2 flex-1 justify-end gap-2 border-0 bg-transparent pr-3 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
											/>
										</>
									) : (
										<Input
											value={attr.default || ''}
											onChange={(e) => updateField('default', e.currentTarget.value)}
											disabled={isLocked}
											size="sm"
											className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
										/>
									)}
								</Row>

								<Row>
									<RowLabel>Nullable</RowLabel>
									<Switch
										checked={attr.nullable}
										onCheckedChange={(val) => updateField('nullable', val)}
										disabled={isLocked}
										className="mr-3 h-4 w-7"
										thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
									/>
								</Row>

								<Row>
									<RowLabel>Selectable</RowLabel>
									<Switch
										checked={attr.selectable}
										onCheckedChange={(val) => updateField('selectable', val)}
										disabled={isLocked}
										className="mr-3 h-4 w-7"
										thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
									/>
								</Row>

								<Row>
									<RowLabel>Insertable</RowLabel>
									<Switch
										checked={attr.insertable}
										onCheckedChange={(val) => updateField('insertable', val)}
										disabled={isLocked}
										className="mr-3 h-4 w-7"
										thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
									/>
								</Row>
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
