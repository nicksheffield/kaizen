import { CSSProperties, type ElementType, useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Attribute, Model as BasicModel, AttributeType, AttributeTypeNames } from '@/lib/projectSchemas'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, getIsUserAttr } from '@/lib/utils'
import { useERDContext } from '@/lib/ERDContext'
import { getLogicalRecommend, getSourceName, getTargetName, isReservedKeyword } from '@/lib/ERDHelpers'
import { useAttrField } from '@/lib/useAttrField'
import { SelectList } from '@/components/SelectList'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useReactFlow, getNodesBounds } from '@xyflow/react'
import { FormRow } from '@/components/FormFields'
import { Card } from '@/components/ui/card'
import { Switcher } from '@/components/Switcher'

const sheetWidth = 600

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
	const {
		relations,
		nodes,
		attrTypeRecommends,
		modalHasPopover,
		setModalHasPopover,
		showAuthAttributes,
		showTypes,
		frameRef,
	} = useERDContext()

	const node = nodes.find((x) => x.data.id === model.id)

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

	const flow = useReactFlow()
	// const [prevViewport, setPrevViewport] = useState<Viewport | null>(null)

	const [isPopoverOpen, setPopoverOpen] = useState(false)
	const onPopoverOpen = (val: boolean) => {
		setPopoverOpen(val)

		if (val) {
			setModalHasPopover(model.id)
			// setPrevViewport(flow.getViewport())

			if (node) {
				const viewWidth = window.innerWidth - sheetWidth
				const viewHeight = frameRef.current?.clientHeight || 0 // 872

				const bounds = getNodesBounds([node], { nodeOrigin: [-0.5, -0.5] })

				flow.setViewport(
					{
						x: bounds.x * -1 + viewWidth / 2,
						y: bounds.y * -1 + viewHeight / 2,
						zoom: 1,
					},
					{
						duration: 600,
					}
				)
			}
		} else {
			setModalHasPopover(null)

			// if (prevViewport !== null) {
			// 	flow.setViewport(prevViewport, { duration: 200 })
			// }
		}
	}

	const isActiveModel = modalHasPopover === model.id
	const openPopover = isActiveModel && isPopoverOpen

	if (isUserAttr && !showAuthAttributes) return null

	return (
		<div key={attr.id} className="relative flex flex-col px-2" ref={setNodeRef} style={style}>
			<Sheet open={openPopover} onOpenChange={onPopoverOpen}>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						size="xs"
						className={cn(
							'flex h-[24px] items-center justify-between gap-6 rounded-sm px-1 py-0 hover:bg-primary/5',
							isPopoverOpen &&
								'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground'
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
						{showTypes && (
							<div className={cn('font-mono text-xs opacity-50', isPopoverOpen && 'opacity-100')}>
								{attr.type}
							</div>
						)}
					</Button>
				</SheetTrigger>

				<SheetContent
					side="right"
					className="flex h-screen flex-col justify-between overflow-y-scroll border-0 dark:border-l sm:max-w-[var(--sheet-width)]"
					style={{ '--sheet-width': `${sheetWidth}px` } as CSSProperties}
				>
					<div className="flex flex-col divide-y">
						<SheetHeader className="pb-6">
							<SheetTitle>Edit Field</SheetTitle>
						</SheetHeader>

						<div className="flex flex-col gap-8 py-6">
							{isUserAttr && (
								<div className="flex h-10 items-center justify-start rounded-md bg-muted px-3 text-sm text-muted-foreground">
									<UserIcon className="mr-2 h-4 w-4" />
									This is an Auth field.
								</div>
							)}

							{attr.name === 'id' ? (
								<FormRow
									label="Type"
									description="The type of the attribute. This affects both the database and the GraphQL API."
								>
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
								</FormRow>
							) : (
								<>
									<FormRow
										label="Name"
										description="The name of the attribute. Always use camelcase."
									>
										<Input
											value={name || ''}
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
									</FormRow>

									<FormRow
										label="Type"
										description="The type of the attribute. This affects both the database and the GraphQL API."
									>
										<SelectList
											value={attr.type}
											onValueChange={(val) => setType(val)}
											disabled={isLocked}
											options={Object.entries(AttributeTypeNames).map(([key, type]) => ({
												value: key,
												label: type.label,
												description: type.description,
											}))}
											clearable={false}
										/>
									</FormRow>

									<FormRow label="Default" description="The default value of the attribute.">
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
												/>
											</>
										) : (
											<Input
												value={attr.default || ''}
												onChange={(e) => updateField('default', e.currentTarget.value)}
												disabled={isLocked}
											/>
										)}
									</FormRow>
								</>
							)}

							{attr.name !== 'id' && (
								<Card className="divide-y divide-input overflow-hidden border">
									<Switcher
										label="Nullable"
										description="Makes the field nullable. Null values are allowed."
										checked={attr.nullable}
										onCheckedChange={(val) => updateField('nullable', val)}
										disabled={isLocked}
									/>
									<Switcher
										label="Selectable"
										description="Allows the field to be selected in the gql api."
										checked={attr.selectable}
										onCheckedChange={(val) => updateField('selectable', val)}
										disabled={isLocked}
									/>
									<Switcher
										label="Insertable"
										description="Allows the field to be inserted in the gql api."
										checked={attr.insertable}
										onCheckedChange={(val) => updateField('insertable', val)}
										disabled={isLocked}
									/>
								</Card>
							)}
						</div>
					</div>

					{!isLocked && (
						<SheetFooter className="flex-row justify-start">
							<Button
								variant="outline"
								onClick={remove}
								className="flex items-center justify-start gap-2"
							>
								<Trash2Icon className="h-4 w-4 opacity-50" /> Delete
							</Button>
						</SheetFooter>
					)}
				</SheetContent>
			</Sheet>
		</div>
	)
}
