import { Dispatch, SetStateAction, useState } from 'react'
import { useStore, useUpdateNodeInternals, type NodeProps } from 'reactflow'
import { camelize, cn, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CalendarIcon, LockIcon, PlusIcon, Settings2Icon, Trash2Icon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
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
import { Row, RowLabel } from '@/components/ERD/Rows'

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

export const ModelNode = ({ data, selected }: NodeProps<Model>) => {
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
	} = useERDContext()

	const hasUserModel = nodes.some((x) => x.data.id === userModelId)

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

	const [isPopoverOpen, setPopoverOpen] = useState(false)
	const onPopoverOpen = (val: boolean) => {
		setPopoverOpen(val)
		if (val) {
			setModalHasPopover(data.id)
		} else {
			setModalHasPopover(null)
		}
	}

	const isActiveModel = modalHasPopover === data.id
	const openPopover = isActiveModel && isPopoverOpen

	return (
		<div
			className={cn(
				'flex min-w-[216px] cursor-default flex-col gap-4 overflow-hidden rounded-md border bg-muted pb-3 shadow-xl transition-all',
				selected && 'ring-2 ring-primary dark:ring-offset-background',
				!data.enabled && 'opacity-50',
				modalHasPopover && !isActiveModel && 'opacity-50'
			)}
			onMouseDown={() => {
				addSelectedNodes([data.id])
			}}
		>
			<div
				className={cn(
					'drag-handle flex h-[36px] cursor-grab items-center justify-between pl-3 pr-3 text-foreground active:cursor-grabbing',
					selected && 'text-foreground'
				)}
				onDoubleClick={() => {
					const node = nodes.find((x) => x.data.id === data.id)
					if (!node) return
					focusOn(node)
				}}
			>
				{data.name ? (
					<div className={cn('text-sm font-medium', nameConflicted && 'text-destructive')}>{data.name}</div>
				) : (
					<div className="italic text-destructive">New Model</div>
				)}

				<Popover open={openPopover} onOpenChange={onPopoverOpen}>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="xs" className="h-5 w-5 px-0">
							<Settings2Icon className="h-3 w-3" />
						</Button>
					</PopoverTrigger>

					<PopoverContent align="start" side="right" sideOffset={20} alignOffset={-56} className="p-0">
						<div className="flex flex-col divide-y">
							<div className="flex h-10 items-center justify-between px-3 pr-2">
								<div className="text-sm font-medium">Model</div>

								<div className="flex items-center gap-2">
									{isModelLocked(data) ? (
										<Button variant="ghost" size="xs" className="pointer-events-none">
											<LockIcon className="h-4 w-4" />
										</Button>
									) : (
										<Button
											variant="ghost"
											size="xs"
											onClick={() => {
												removeSelf()
												setModalHasPopover(null)
											}}
										>
											<Trash2Icon className="h-4 w-4 opacity-50" />
										</Button>
									)}
								</div>
							</div>

							{/* <RowGap /> */}

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

							<Row>
								<RowLabel>Name</RowLabel>
								<Input
									value={name}
									onChange={(e) => {
										setName(e.currentTarget.value.replace(/\s/g, ''))
									}}
									size="sm"
									className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
									autoFocus
								/>
							</Row>

							<Row>
								<RowLabel>Key</RowLabel>
								<Input
									value={key}
									onChange={(e) => {
										setKey(e.currentTarget.value)
									}}
									size="sm"
									disabled={isModelLocked(data)}
									placeholder={keyPlaceholder}
									className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
								/>
							</Row>

							<Row>
								<RowLabel>Table</RowLabel>
								<Input
									value={tableName}
									onChange={(e) => setTableName(e.currentTarget.value)}
									placeholder={tablePlaceholder}
									size="sm"
									className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
								/>
							</Row>

							<Row>
								<RowLabel>Audit Dates</RowLabel>
								<Switch
									checked={data.auditDates}
									onCheckedChange={(val) => updateModelField('auditDates', val)}
									className="mr-3 h-4 w-7"
									thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
								/>
							</Row>

							{/* <Row>
								<RowLabel>Enabled</RowLabel>
								<Switch
									checked={data.enabled}
									onCheckedChange={(val) => updateModelField('enabled', val)}
									disabled={isUserModel}
									className="mr-3 h-4 w-7"
									thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
								/>
							</Row> */}
						</div>
					</PopoverContent>
				</Popover>
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
