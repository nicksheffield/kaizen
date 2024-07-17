import { CSSProperties, useCallback, useMemo, useState } from 'react'
import { getNodesBounds, Handle, Position, useReactFlow } from '@xyflow/react'
import { alphabetical, camelize, cn, generateId, uc } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowRightIcon, LinkIcon, RepeatIcon, Trash2Icon } from 'lucide-react'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useERDContext } from '@/lib/ERDContext'
import { plural, singular } from 'pluralize'
import { RelationType, type Model, type Relation } from '@/lib/projectSchemas'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getSourceName, getTargetName } from '@/lib/ERDHelpers'
import { SelectList } from '@/components/SelectList'
import { Switch } from '@/components/ui/switch'
import { FormRow } from '@/components/FormFields'
import { Card } from '@/components/ui/card'
import { Switcher } from '@/components/Switcher'
import { Separator } from '@/components/ui/separator'
import { labelVariants } from '@/components/ui/label'

const sheetWidth = 600

type Mode = 'source' | 'target'

type RelationRowProps = {
	rel: Relation
	model: Model
	mode: Mode
}

export const RelationRow = ({ rel, model, mode }: RelationRowProps) => {
	const {
		nodes,
		relations,
		setRelations,
		addNode,
		focusOn,
		showTypes,
		modalHasPopover,
		setModalHasPopover,
		frameRef,
	} = useERDContext()
	const attrs = nodes.flatMap((x) => x.data.attributes)

	const node = nodes.find((x) => x.data.id === model.id)

	const sourceCardinality = rel.type === 'oneToMany' || rel.type === 'oneToOne' ? 'one' : 'many'
	const targetCardinality = rel.type === 'oneToMany' || rel.type === 'manyToMany' ? 'many' : 'one'

	const sourceModel = nodes.find((x) => x.data.id === rel.sourceId)?.data
	const targetModel = nodes.find((x) => x.data.id === rel.targetId)?.data

	const sourceType = sourceCardinality === 'one' ? `${sourceModel?.name || ''}` : `${sourceModel?.name || ''}[]`
	const targetType = targetCardinality === 'one' ? `${targetModel?.name || ''}` : `${targetModel?.name || ''}[]`

	const sourceName = getSourceName(rel, nodes)
	const targetName = getTargetName(rel, nodes)

	const bothLocked = sourceModel?.id === model.id && targetModel?.id === model.id
	const sourceLocked = sourceModel?.id === model.id
	const targetLocked = bothLocked ? false : targetModel?.id === model.id

	const removeSelf = () => {
		setRelations((prev) => prev.filter((a) => a.id !== rel.id))
		setModalHasPopover(null)
	}

	const update = useCallback(
		(rel: Relation) => {
			setRelations((prev) => prev.map((a) => (a.id === rel.id ? rel : a)))
		},
		[setRelations]
	)

	const updateField = (field: keyof Relation, value: Relation[typeof field]) => {
		update({ ...rel, [field]: value })
	}

	const split = () => {
		if (!targetModel || !sourceModel) return

		const jtModel = addNode({ name: `${sourceModel.name}_${targetModel.name}` })

		const newRelSource = {
			id: generateId(),
			type: RelationType.oneToMany,
			sourceName: '',
			targetName: camelize(targetModel.name),
			sourceOrder: 0,
			targetOrder: rel.sourceOrder,
			optional: false,
			enabled: true,
			sourceId: sourceModel.id,
			targetId: jtModel.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
			source: sourceModel,
			target: jtModel,
		}

		const newRelTarget = {
			id: generateId(),
			type: RelationType.oneToMany,
			sourceName: '',
			targetName: camelize(sourceModel.name),
			sourceOrder: rel.sourceOrder,
			targetOrder: 1,
			optional: false,
			enabled: true,
			sourceId: targetModel.id,
			targetId: jtModel.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
			source: targetModel,
			target: jtModel,
		}

		setRelations((prev) => [...prev, newRelSource, newRelTarget])
		setTimeout(() => {
			removeSelf()
			setModalHasPopover(null)
		}, 1)
	}

	const swap = () => {
		if (!targetModel || !sourceModel) return

		const newRel: typeof rel = {
			...rel,
			sourceId: rel.targetId,
			targetId: rel.sourceId,
			sourceOrder: rel.targetOrder,
			targetOrder: rel.sourceOrder,
			sourceName: rel.targetName,
			targetName: rel.sourceName,
		}

		update(newRel)
	}

	const sourceDescription = useMemo(() => {
		const name = (targetModel?.name || 'Model').toLowerCase()
		const sourceName =
			sourceCardinality === 'one'
				? singular(rel.sourceName || sourceModel?.name || 'Model').toLowerCase()
				: plural(rel.sourceName || sourceModel?.name || 'Model').toLowerCase()
		return `
			Each ${name}  ${rel.optional && sourceCardinality === 'one' ? 'may have' : 'has'} ${
				sourceCardinality === 'one' ? 'one' : 'many'
			} ${sourceName || 'Model'}
		`
	}, [targetModel?.name, sourceCardinality, rel.sourceName, rel.optional, sourceModel?.name])

	const targetDescription = useMemo(() => {
		const name = (sourceModel?.name || 'Model').toLowerCase()
		const targetName =
			targetCardinality === 'one'
				? singular(rel.targetName || targetModel?.name || 'Model').toLowerCase()
				: plural(rel.targetName || targetModel?.name || 'Model').toLowerCase()
		return `
			Each ${name} ${rel.optional && targetCardinality === 'one' ? 'may have' : 'has'} ${
				targetCardinality === 'one' ? 'one' : 'many'
			} ${targetName || 'Model'}
		`
	}, [sourceModel?.name, targetCardinality, rel.targetName, rel.optional, targetModel?.name])

	const isSource = sourceModel?.id === model.id

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: rel.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const name = mode === 'source' ? targetName : sourceName
	const type = mode === 'source' ? targetType : sourceType

	const nameConflicted =
		relations.some((x) => {
			if (x.id === rel.id) return false

			if (mode === 'source' && x.sourceId === rel.sourceId) return getTargetName(x, nodes) === targetName
			if (mode === 'target' && x.targetId === rel.targetId) return getSourceName(x, nodes) === sourceName

			return false
		}) ||
		attrs.some((y) => {
			if (y.modelId === rel.sourceId) return y.name === name
			if (y.modelId === rel.targetId) return y.name === name
		})

	const flow = useReactFlow()

	const [isPopoverOpen, setPopoverOpen] = useState(false)

	const onPopoverOpen = (val: boolean) => {
		setPopoverOpen(val)
		if (val) {
			setModalHasPopover(model.id)

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

	const isActiveModel = modalHasPopover === model.id
	const openPopover = isActiveModel && isPopoverOpen

	const thisSide = isSource ? (
		<RelationSide
			idValue={rel.sourceId}
			idField="sourceId"
			description={sourceDescription}
			isLocked={sourceLocked}
			isSource
			isThis
			thisCardinality={sourceCardinality}
			changeCardinality={() => {
				if (sourceCardinality !== 'one') {
					updateField('type', targetCardinality === 'one' ? 'oneToOne' : 'oneToMany')
				} else {
					updateField('type', targetCardinality === 'one' ? 'manyToOne' : 'manyToMany')
				}
			}}
			relation={rel}
			updateField={updateField}
		/>
	) : (
		<RelationSide
			idValue={rel.targetId}
			idField="targetId"
			description={targetDescription}
			isLocked={targetLocked}
			isSource={false}
			isThis
			thisCardinality={targetCardinality}
			changeCardinality={() => {
				if (targetCardinality !== 'one') {
					updateField('type', sourceCardinality === 'one' ? 'oneToOne' : 'manyToOne')
				} else {
					updateField('type', sourceCardinality === 'one' ? 'oneToMany' : 'manyToMany')
				}
			}}
			relation={rel}
			updateField={updateField}
		/>
	)

	const otherSide = isSource ? (
		<RelationSide
			idValue={rel.targetId}
			idField="targetId"
			description={targetDescription}
			isLocked={targetLocked}
			isSource={false}
			isThis={false}
			thisCardinality={targetCardinality}
			changeCardinality={() => {
				if (targetCardinality !== 'one') {
					updateField('type', sourceCardinality === 'one' ? 'oneToOne' : 'manyToOne')
				} else {
					updateField('type', sourceCardinality === 'one' ? 'oneToMany' : 'manyToMany')
				}
			}}
			relation={rel}
			updateField={updateField}
		/>
	) : (
		<RelationSide
			idValue={rel.sourceId}
			idField="sourceId"
			description={sourceDescription}
			isLocked={sourceLocked}
			isSource
			isThis={false}
			thisCardinality={sourceCardinality}
			changeCardinality={() => {
				if (sourceCardinality !== 'one') {
					updateField('type', targetCardinality === 'one' ? 'oneToOne' : 'oneToMany')
				} else {
					updateField('type', targetCardinality === 'one' ? 'manyToOne' : 'manyToMany')
				}
			}}
			relation={rel}
			updateField={updateField}
		/>
	)

	return (
		<div key={rel.id} className="group/row relative flex flex-col px-2" ref={setNodeRef} style={style}>
			<Sheet open={openPopover} onOpenChange={onPopoverOpen}>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						size="xs"
						className={cn(
							'flex h-[24px] items-center justify-between gap-6 rounded-sm px-1 py-0 hover:bg-primary/20',
							isPopoverOpen &&
								'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
						)}
					>
						<div className="flex items-center gap-2">
							<LinkIcon
								className={cn(
									'h-4 w-4 cursor-grab opacity-25 active:cursor-grabbing',
									isPopoverOpen && 'opacity-75'
								)}
								{...attributes}
								{...listeners}
							/>
							{name ? (
								<div
									className={cn(
										'text-xs',
										nameConflicted && 'text-destructive',
										!rel.enabled && 'text-muted-foreground',
										!sourceModel?.enabled && 'text-muted-foreground',
										!targetModel?.enabled && 'text-muted-foreground',
										isPopoverOpen && 'text-primary-foreground'
									)}
								>
									{name}
								</div>
							) : (
								<div
									className={cn(
										'text-xs italic text-destructive',
										isPopoverOpen && 'text-primary-foreground'
									)}
								>
									New Relationship
								</div>
							)}{' '}
						</div>
						<div
							className={cn(
								'font-mono text-xs opacity-50 transition-opacity hover:underline',
								isPopoverOpen && 'opacity-100',
								!showTypes && 'mr-1.5 opacity-0 group-hover/row:opacity-100'
							)}
							onClick={(e) => {
								const n = nodes.find((x) => {
									if (mode === 'source') {
										return x.id === rel.targetId
									} else {
										return x.id === rel.sourceId
									}
								})
								if (n) {
									e.stopPropagation()
									focusOn(n)
								}
							}}
						>
							{showTypes ? type : <ArrowRightIcon className="h-4 w-4" />}
						</div>
					</Button>
				</SheetTrigger>

				<SheetContent
					side="right"
					className="flex h-screen min-h-0 flex-col justify-between overflow-y-scroll border-0 dark:border-l sm:max-w-[var(--sheet-width)]"
					style={{ '--sheet-width': `${sheetWidth}px` } as CSSProperties}
				>
					<div className="flex flex-col divide-y">
						<SheetHeader className="pb-6">
							<SheetTitle>Edit Relationship</SheetTitle>
						</SheetHeader>

						<div className="flex flex-col gap-6 py-6">
							{otherSide}

							{thisSide}

							<Card className="divide-y divide-input overflow-hidden border">
								<Switcher
									label="Optional"
									description="Makes the relationship optional."
									checked={rel.optional}
									onCheckedChange={(val) => updateField('optional', val)}
								/>

								{rel.type === 'manyToMany' && (
									<button
										className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 p-4 text-left hover:bg-muted"
										onClick={() => split()}
									>
										<div className="flex flex-1 flex-col gap-0">
											<div className={cn(labelVariants(), 'leading-normal')}>
												Swap foreign key
											</div>
											<div className="text-xs text-muted-foreground">
												Many to many relationships are not supported
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
												Expose joining table
											</div>
										</div>
									</button>
								)}

								{rel.type === 'oneToOne' && (
									<button
										className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 p-4 text-left hover:bg-muted"
										onClick={() => swap()}
									>
										<div className="flex flex-1 flex-col gap-0">
											<div className={cn(labelVariants(), 'leading-normal')}>
												Swap foreign key
											</div>
											<div className="text-xs text-muted-foreground">
												{sourceModel?.name || 'source'} has a{' '}
												{singular(targetModel?.name.toLowerCase() || 'target')}Id field
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
												<RepeatIcon className="w-4" />
											</div>
										</div>
									</button>
								)}
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

			<Handle type="source" position={Position.Right} id={`${rel.id}-r`} className="opacity-0" />
			<Handle type="source" position={Position.Left} id={`${rel.id}-l`} className="opacity-0" />
			<Handle type="target" position={Position.Right} id={`${rel.id}-target-r`} className="opacity-0" />
			<Handle type="target" position={Position.Left} id={`${rel.id}-target-l`} className="opacity-0" />
		</div>
	)
}

type RelationSideProps = {
	idValue?: string
	idField: keyof Relation
	description: string
	isLocked: boolean
	isSource: boolean
	isThis: boolean
	thisCardinality: 'one' | 'many'
	changeCardinality: () => void
	relation: Relation
	updateField: (field: keyof Relation, value: Relation[typeof field]) => void
}

const RelationSide = ({
	idValue,
	idField,
	description,
	isLocked,
	isSource,
	isThis,
	thisCardinality,
	changeCardinality,
	relation,
	updateField,
}: RelationSideProps) => {
	const { nodes, userModelId } = useERDContext()

	return (
		<div
			className={cn(
				'flex flex-col gap-3 rounded-xl p-4',
				!isThis ? 'bg-primary/80 text-light dark:bg-muted' : 'bg-muted dark:border dark:bg-background'
			)}
		>
			<div className={cn('text-sm', !isThis && 'border-0 bg-transparent')}>"{description.trim()}"</div>

			<Separator className={cn(!isThis && 'bg-light/10')} />

			<div className="grid grid-cols-[120px,1fr] gap-4">
				<FormRow label="Type" description="Has one or many">
					<Button
						variant="outline"
						onClick={changeCardinality}
						className={cn(
							!isThis &&
								'border-transparent bg-background/20 text-light focus-visible:border-light focus-visible:ring-light'
						)}
					>
						{uc(thisCardinality)}
					</Button>
				</FormRow>

				<FormRow
					label={`${isThis ? 'This' : 'Target'} Model`}
					description="The model this relationship is pointing to"
				>
					<SelectList
						value={idValue}
						onValueChange={(id) => {
							const model = nodes.find((x) => x.data.id === id)?.data
							if (!model) return

							updateField(idField, model.id)
						}}
						disabled={isLocked}
						clearable={false}
						options={nodes
							.map((x) => x.data)
							.slice()
							.sort((a, b) => alphabetical(a.name, b.name))
							.map((x) => ({ value: x.id, label: x.name }))}
						className={cn(
							!isThis &&
								'border-transparent bg-background/20 text-light focus:border-light focus:ring-light'
						)}
					/>
				</FormRow>
			</div>

			<div className="grid grid-cols-[1fr,1fr] gap-4">
				<FormRow label="Alias" description="Rename this side of the relationship">
					<Input
						value={(isSource ? relation.sourceName : relation.targetName) || ''}
						onChange={(e) => updateField(isSource ? 'sourceName' : 'targetName', e.currentTarget.value)}
						className={cn(
							!isThis &&
								'border-transparent bg-background/20 text-light focus-visible:border-light focus-visible:ring-light'
						)}
					/>
				</FormRow>

				{((isSource && relation.sourceId === userModelId) ||
					(!isSource && relation.targetId === userModelId)) && (
					<FormRow label="Default to creator" description="Automatically set this as the creator user.">
						<Switch
							checked={!!relation.sourceDefaultToAuth}
							onCheckedChange={(val) => updateField('sourceDefaultToAuth', val)}
							className="mt-2 data-[state=unchecked]:bg-light/20"
						/>
					</FormRow>
				)}
			</div>
		</div>
	)
}
