import { CSSProperties, Dispatch, SetStateAction, useState } from 'react'
import {
	useStore,
	useUpdateNodeInternals,
	type NodeProps,
	type Node,
	getNodesBounds,
	useReactFlow,
} from '@xyflow/react'
import { camelize, cn, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CalendarIcon, PlusIcon, Settings2Icon, Trash2Icon, UserIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useERDContext } from '@/lib/ERDContext'
import { z } from 'zod'
import { FieldRow } from './FieldRow'
import { AttributeRow } from './AttributeRow'
import { RelationRow } from './RelationRow'
import { Attribute, Model as BasicModel, AttributeType, RelationType, Relation } from '@/lib/projectSchemas'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { useModelField } from '@/lib/useModelField'
import { isReservedKeyword } from '@/lib/ERDHelpers'
import { plural } from 'pluralize'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FormRow } from '@/components/FormFields'
import { Card } from '@/components/ui/card'
import { Switcher } from '@/components/Switcher'

const sheetWidth = 600

type Model = BasicModel & {
	attributes: Attribute[]
}

const AttrType = z.enum(['id', 'a_i', 'text', 'password', 'int', 'float', 'boolean', 'datetime', 'date', 'time'])

const validateSuggestionType = (suggestion?: string) => {
	const validation = AttrType.safeParse(suggestion)
	if (validation.success) {
		return validation.data
	}
}

const isModelLocked = (model: Model) => {
	if (model.key === 'user') return true
	return false
}

export const ModelNode = ({ data, selected }: NodeProps<Node<Model>>) => {
	const {
		project,
		userModelId,
		setUserModelId,
		nodes,
		setNodes,
		detailed,
		relations,
		setRelations,
		modalHasPopover,
		setModalHasPopover,
		focusOn,
		frameRef,
	} = useERDContext()

	const node = nodes.find((x) => x.data.id === data.id)

	const hasUserModel = nodes.some((x) => x.data.id === userModelId)
	const isUserModel = data.id === userModelId

	const sourceRelations = relations.filter((x) => x.sourceId === data.id)
	const targetRelations = relations.filter((x) => x.targetId === data.id)

	const [name, setName] = useModelField(data.id, 'name')
	const [key, setKey] = useModelField(data.id, 'key')
	const [tableName, setTableName] = useModelField(data.id, 'tableName')

	const keyPlaceholder = camelize(name)
	const tablePlaceholder = plural(camelize(name))

	const removeSelf = () => {
		setNodes((prev) => prev.filter((n) => n.id !== data.id))
		setRelations((prev) => prev.filter((r) => r.sourceId !== data.id && r.targetId !== data.id))
	}

	const updateModel = (model: Model) => {
		setNodes((prev) => {
			const index = prev.findIndex((n) => n.id === model.id)
			if (index === -1) return prev

			const newNodes = [...prev]
			const node = newNodes[index]
			if (!node) return prev
			newNodes[index] = { ...node, data: model }
			return newNodes
		})
	}

	const updateModelField = (field: keyof Model, value: Model[typeof field]) => {
		updateModel({ ...data, [field]: value })
	}

	const addAttribute = (suggestion?: { name: string; type: string }) => {
		updateModel({
			...data,
			attributes: [
				...data.attributes,
				{
					id: generateId(),
					name: suggestion?.name || '',
					type: validateSuggestionType(suggestion?.type) || AttributeType.text,
					order: data.attributes.length,
					modelId: data.id,
					nullable: false,
					selectable: true,
					insertable: true,
					default: '',
					enabled: true,
				},
			],
		})
	}

	const removeAttribute = (id: Attribute['id']) => {
		const attr = data.attributes.find((a) => a.id === id)

		if (!attr) return

		updateModel({
			...data,
			attributes: data.attributes
				.filter((a) => a.id !== id)
				.map((x) => ({
					...x,
					order: x.order > attr.order ? x.order - 1 : x.order,
				})),
		})
	}

	const updateAttribute = (attr: Model['attributes'][number]) => {
		updateModel({
			...data,
			attributes: data.attributes.map((a) => (a.id === attr.id ? attr : a)),
		})
	}

	const updateAttributeField = (
		attr: Model['attributes'][number],
		field: keyof Model['attributes'][number],
		value: Model['attributes'][number][typeof field]
	) => {
		updateAttribute({ ...attr, [field]: value })
	}

	const addRelation = () => {
		if (!project) return

		setRelations((prev) => {
			const newRel = {
				id: generateId(),
				type: RelationType.manyToOne,
				sourceName: '',
				targetName: '',
				sourceOrder: sourceRelations.length + targetRelations.length,
				targetOrder: 99,
				optional: false,
				enabled: true,
				sourceId: data.id,
				targetId: '',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			return [...prev, newRel]
		})
	}

	const nameConflicted =
		nodes
			.map((x) => x.data)
			.filter((x) => x.id !== data.id)
			.some((x) => x.name === data.name) || isReservedKeyword(data.name, true)

	const addSelectedNodes = useStore((store) => store.addSelectedNodes)

	const flow = useReactFlow()

	const [isPopoverOpen, setPopoverOpen] = useState(false)
	const onPopoverOpen = (val: boolean) => {
		setPopoverOpen(val)
		if (val) {
			setModalHasPopover(data.id)

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
		}
	}

	const isActiveModel = modalHasPopover === data.id
	const openPopover = isActiveModel && isPopoverOpen

	return (
		<div
			className={cn(
				'flex min-w-[216px] cursor-default flex-col gap-4 rounded-md bg-background pb-3 dark:border',
				selected &&
					'opacity-100 ring-2 ring-primary transition-opacity duration-200 dark:ring-offset-background',
				!data.enabled && 'opacity-50',
				modalHasPopover && !isActiveModel && 'opacity-20'
				// selected && 'relative z-[9999]'
			)}
			onMouseDown={() => {
				addSelectedNodes([data.id])
			}}
			// onClick={(e) => e.stopPropagation()}
		>
			<div
				className={cn(
					'drag-handle flex h-[36px] cursor-grab items-center justify-between rounded-t-md pl-3 pr-3 text-foreground active:cursor-grabbing',
					selected && 'text-foreground'
				)}
				onDoubleClick={() => {
					const node = nodes.find((x) => x.data.id === data.id)
					if (!node) return
					focusOn(node)
				}}
			>
				{data.name ? (
					<div
						className={cn(
							'flex items-center gap-2 text-sm font-medium',
							nameConflicted && 'text-destructive'
						)}
					>
						{isUserModel && <UserIcon className="mr-1 h-4 w-4" />}
						{data.name}
					</div>
				) : (
					<div className="italic text-destructive">New Model</div>
				)}

				<Sheet open={openPopover} onOpenChange={onPopoverOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="xs" className="h-5 w-5 px-0">
							<Settings2Icon className="h-3 w-3" />
						</Button>
					</SheetTrigger>

					<SheetContent
						side="right"
						className="flex h-screen flex-col justify-between overflow-y-scroll border-0 dark:border-l sm:max-w-[var(--sheet-width)]"
						style={{ '--sheet-width': `${sheetWidth}px` } as CSSProperties}
					>
						<div className="flex flex-col divide-y">
							<SheetHeader className="pb-6">
								<SheetTitle>Model</SheetTitle>
							</SheetHeader>

							<div className="flex flex-col gap-8 py-6">
								{isUserModel && (
									<div className="flex h-10 items-center justify-start bg-muted px-3 text-sm text-muted-foreground">
										<UserIcon className="mr-2 h-4 w-4" />
										This is the Auth model.
									</div>
								)}

								{!hasUserModel && (
									<div className="flex flex-col gap-2 p-2">
										<Button
											size="sm"
											onClick={() => {
												setUserModelId(data.id)
											}}
										>
											Set as Auth Model
										</Button>
										<div className="rounded-md bg-accent p-2 text-sm text-muted-foreground">
											The auth model comes with a set of required attributes.
										</div>
									</div>
								)}

								<FormRow label="Name" description="The name of the model.">
									<Input
										value={name}
										onChange={(e) => {
											setName(e.currentTarget.value.replace(/\s/g, ''))
										}}
										autoFocus
									/>
								</FormRow>

								<FormRow
									label="Key"
									description="This is the name used in generated code. Edit it if you run into problems."
								>
									<Input
										value={key}
										onChange={(e) => {
											setKey(e.currentTarget.value)
										}}
										disabled={isModelLocked(data)}
										placeholder={keyPlaceholder}
									/>
								</FormRow>

								<FormRow label="Table" description="The name of the table in the database.">
									<Input
										value={tableName}
										onChange={(e) => setTableName(e.currentTarget.value)}
										placeholder={tablePlaceholder}
									/>
								</FormRow>

								<Card className="divide-y divide-input overflow-hidden border">
									<Switcher
										label="Audit Dates"
										description="If enabled, the createdAt, updatedAt and deletedAt fields will be added to the model."
										checked={data.auditDates}
										onCheckedChange={(val) => updateModelField('auditDates', val)}
									/>
								</Card>
							</div>
						</div>

						<SheetFooter className="flex-row justify-start">
							<Button
								variant="outline"
								onClick={removeSelf}
								className="flex items-center justify-start gap-2"
							>
								<Trash2Icon className="h-4 w-4 opacity-50" /> Delete
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</div>

			<div className="flex flex-col gap-1">
				<div className="flex flex-row justify-between px-3">
					<div className="text-xs font-medium text-muted-foreground/50">Fields</div>
					<Button variant="ghost" size="xs" className="h-5 w-5 px-0" onClick={() => addAttribute()}>
						<PlusIcon className="h-3 w-3" />
					</Button>
				</div>
				<Attributes
					model={data}
					detailed={detailed}
					remove={(id) => {
						removeAttribute(id)
						setModalHasPopover(null)
					}}
					updateAttributes={(attrs) => updateModel({ ...data, attributes: attrs })}
					updateAttributeField={updateAttributeField}
				/>
			</div>

			<div className="flex flex-col gap-1">
				<div className="flex flex-row justify-between px-3">
					<div className="text-xs font-medium text-muted-foreground/50">Relationships</div>
					<Button variant="ghost" size="xs" className="h-5 w-5 px-0" onClick={() => addRelation()}>
						<PlusIcon className="h-3 w-3" />
					</Button>
				</div>
				<Relations
					model={data}
					sourceRelations={sourceRelations.map((x) => ({ ...x, dir: 'source' }))}
					targetRelations={targetRelations.map((x) => ({ ...x, dir: 'target' }))}
					updateRelations={setRelations}
				/>
			</div>

			{data.auditDates && detailed && (
				<div className="pointer-events-none flex flex-col gap-1">
					<div className="flex flex-row justify-between px-3">
						<div className="text-xs font-medium text-muted-foreground/50">Audit Dates</div>
					</div>
					<div className="pointer-events-none flex flex-col px-2">
						<FieldRow title="createdAt" type="datetime" icon={CalendarIcon} />
						<FieldRow title="updatedAt?" type="datetime" icon={CalendarIcon} />
						<FieldRow title="deletedAt?" type="datetime" icon={CalendarIcon} />
					</div>
				</div>
			)}
		</div>
	)
}

type AttributesProps = {
	model: Model
	detailed: boolean
	remove: (id: string) => void
	updateAttributeField: (
		attr: Model['attributes'][number],
		field: keyof Model['attributes'][number],
		value: Model['attributes'][number][typeof field]
	) => void
	updateAttributes: (attrs: Model['attributes']) => void
}

const Attributes = ({ model, detailed, remove, updateAttributeField, updateAttributes }: AttributesProps) => {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const sorted = model.attributes.filter((x) => x.name !== 'id').sort((a, b) => (a.order > b.order ? 1 : -1))

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		let items = [...sorted]

		if (active.id !== over?.id) {
			const oldIndex = items.findIndex((x) => x.id === active.id)
			const newIndex = items.findIndex((x) => x.id === over?.id)

			items = arrayMove(items, oldIndex, newIndex)

			updateAttributes(
				model.attributes.map((x) => {
					const order = items.findIndex((y) => y.id === x.id) || 0

					return { ...x, order: x.name === 'id' ? -1 : order }
				})
			)
		}
	}

	const idRow = model.attributes.find((x) => x.name === 'id')

	return (
		<div className="flex flex-col">
			{idRow && detailed && (
				<AttributeRow
					attr={idRow}
					model={model}
					remove={() => remove(idRow.id)}
					updateField={(field, value) => updateAttributeField(idRow, field, value)}
				/>
			)}

			<div className="flex flex-col">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToVerticalAxis, restrictToParentElement]}
				>
					<SortableContext items={sorted} strategy={verticalListSortingStrategy}>
						{sorted
							.filter((x) => x !== idRow)
							.map((attr) => (
								<AttributeRow
									key={attr.id}
									attr={attr}
									model={model}
									remove={() => remove(attr.id)}
									updateField={(field, value) => updateAttributeField(attr, field, value)}
								/>
							))}
					</SortableContext>
				</DndContext>
			</div>
		</div>
	)
}

type SourceRelation = Relation & { dir: 'source' }
type TargetRelation = Relation & { dir: 'target' }

type RelationsProps = {
	model: Model
	sourceRelations: SourceRelation[]
	targetRelations: TargetRelation[]
	updateRelations: Dispatch<SetStateAction<Relation[]>>
}

const Relations = ({ model, sourceRelations, targetRelations, updateRelations }: RelationsProps) => {
	const updateNodeInternals = useUpdateNodeInternals()

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const sorted = [...sourceRelations, ...targetRelations].sort((a, b) => {
		const aOrder = a.dir === 'source' ? a.targetOrder : a.sourceOrder
		const bOrder = b.dir === 'source' ? b.targetOrder : b.sourceOrder

		return aOrder > bOrder ? 1 : -1
	})

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		let items = [...sorted]

		if (active.id !== over?.id) {
			const oldIndex = items.findIndex((x) => x.id === active.id)
			const newIndex = items.findIndex((x) => x.id === over?.id)

			items = arrayMove(items, oldIndex, newIndex)

			updateRelations((old) =>
				old.map((x) => {
					const order = items.findIndex((y) => y.id === x.id) || 0
					const dirred = sorted.find((y) => y.id === x.id)

					if (dirred?.dir === 'source') return { ...x, targetOrder: order }
					if (dirred?.dir === 'target') return { ...x, sourceOrder: order }

					return x
				})
			)
		}
		setTimeout(() => {
			updateNodeInternals(model.id)
		}, 100)
	}

	return (
		<div className="flex flex-col">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				onDragMove={() => {
					updateNodeInternals(model.id)
				}}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			>
				<SortableContext items={sorted} strategy={verticalListSortingStrategy}>
					{sorted.map((rel) => (
						<RelationRow key={rel.id} rel={rel} model={model} mode={rel.dir} />
					))}
				</SortableContext>
			</DndContext>
		</div>
	)
}
