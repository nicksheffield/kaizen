import { useCallback, useMemo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { alphabetical, camelize, cn, generateId, uc } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LinkIcon, RepeatIcon, Trash2Icon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useERDContext } from '@/lib/ERDContext'
import { plural, singular } from 'pluralize'
import { RelationType, type Model, type Relation } from '@/lib/projectSchemas'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getSourceName, getTargetName } from '@/lib/ERDHelpers'
import { SelectList } from '@/components/SelectList'
import { Switch } from '@/components/ui/switch'
import { Row, RowGap, RowLabel } from '@/components/ERD/Rows'

type Mode = 'source' | 'target'

type RelationRowProps = {
	rel: Relation
	model: Model
	mode: Mode
}

// const zoomSelector = (s: ReactFlowState) => s.transform[2]

export const RelationRow = ({ rel, model, mode }: RelationRowProps) => {
	const { nodes, relations, setRelations, addNode, focusOn, userModelId, modalHasPopover, setModalHasPopover } =
		useERDContext()
	const attrs = nodes.flatMap((x) => x.data.attributes)

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

	return (
		<div key={rel.id} className="relative flex flex-col px-2" ref={setNodeRef} style={style}>
			<Popover open={openPopover} onOpenChange={onPopoverOpen}>
				<PopoverTrigger asChild>
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
								'font-mono text-xs opacity-50 hover:underline',
								isPopoverOpen && 'opacity-100'
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
							{type}
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					side="right"
					sideOffset={18}
					alignOffset={-56}
					className="w-[calc(143*0.25rem)] overflow-hidden bg-background p-0 dark:border-0"
				>
					<div className="flex flex-col divide-y divide-foreground/5">
						<div className="flex h-10 items-center justify-between px-3 pr-2">
							<div className="text-sm font-medium">Relationship</div>

							<Button variant="ghost" size="xs" onClick={removeSelf}>
								<Trash2Icon className="h-4 w-4 opacity-50" />
							</Button>
						</div>

						<div className="grid grid-cols-[1fr,0.75rem,1fr] divide-x divide-foreground/5">
							<div className="flex flex-col divide-y divide-foreground/5">
								<div className="bg-accent px-3 py-2">
									<div className="text-xs font-medium italic text-accent-foreground">
										{sourceDescription}
									</div>
								</div>

								<Row>
									<RowLabel>Model</RowLabel>

									<SelectList
										value={sourceModel?.id}
										onValueChange={(id) => {
											const source = nodes.find((x) => x.data.id === id)?.data
											if (!source) return

											updateField('sourceId', source.id)
										}}
										disabled={sourceLocked}
										clearable={false}
										options={nodes
											.map((x) => x.data)
											.slice()
											.sort((a, b) => alphabetical(a.name, b.name))
											.map((x) => ({ value: x.id, label: x.name }))}
										className="-my-2 flex-1 justify-end gap-2 border-0 bg-transparent pr-3 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>

								<Row>
									<RowLabel>Alias</RowLabel>
									<Input
										value={rel.sourceName || ''}
										onChange={(e) => updateField('sourceName', e.currentTarget.value)}
										size="sm"
										className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>

								<Row>
									<RowLabel>Cardinality</RowLabel>
									<div className="-my-2 mr-1 flex flex-1 justify-end">
										<Button
											variant="ghost"
											size="xs"
											onClick={() => {
												if (sourceCardinality !== 'one') {
													updateField(
														'type',
														targetCardinality === 'one' ? 'oneToOne' : 'oneToMany'
													)
												} else {
													updateField(
														'type',
														targetCardinality === 'one' ? 'manyToOne' : 'manyToMany'
													)
												}
											}}
										>
											{uc(sourceCardinality)}
										</Button>
									</div>
								</Row>

								{rel.sourceId === userModelId && (
									<label className="flex h-10 flex-row items-center justify-between px-3">
										<div className="text-sm font-medium text-muted-foreground">Default to Auth</div>
										<Switch
											checked={rel.sourceDefaultToAuth}
											onCheckedChange={(val) => updateField('sourceDefaultToAuth', val)}
											className="h-4 w-7"
											thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
										/>
									</label>
								)}
							</div>
							<div className="stripes" />
							<div className="flex flex-col divide-y divide-foreground/5">
								<div className="bg-accent px-3 py-2">
									<div className="text-xs font-medium italic text-accent-foreground">
										{targetDescription}
									</div>
								</div>

								<Row>
									<RowLabel>Model</RowLabel>

									<SelectList
										value={targetModel?.id}
										onValueChange={(id) => {
											const target = nodes.find((x) => x.data.id === id)?.data
											if (!target) return

											updateField('targetId', target.id)
										}}
										disabled={targetLocked}
										clearable={false}
										options={nodes
											.map((x) => x.data)
											.slice()
											.sort((a, b) => alphabetical(a.name, b.name))
											.map((x) => ({ value: x.id, label: x.name }))}
										className="-my-2 flex-1 justify-end gap-2 border-0 bg-transparent pr-3 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>

								<Row>
									<RowLabel>Alias</RowLabel>
									<Input
										value={rel.targetName || ''}
										onChange={(e) => updateField('targetName', e.currentTarget.value)}
										size="sm"
										className="-my-1 flex-1 border-0 bg-transparent pr-3 text-right focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								</Row>

								<Row>
									<RowLabel>Cardinality</RowLabel>
									<div className="-my-2 mr-1 flex flex-1 justify-end">
										<Button
											variant="ghost"
											size="xs"
											onClick={() => {
												if (targetCardinality !== 'one') {
													updateField(
														'type',
														sourceCardinality === 'one' ? 'oneToOne' : 'manyToOne'
													)
												} else {
													updateField(
														'type',
														sourceCardinality === 'one' ? 'oneToMany' : 'manyToMany'
													)
												}
											}}
										>
											{uc(targetCardinality)}
										</Button>
									</div>
								</Row>

								{rel.targetId === userModelId && (
									<Row>
										<RowLabel>Default to Auth</RowLabel>
										<Switch
											checked={rel.targetDefaultToAuth}
											onCheckedChange={(val) => updateField('targetDefaultToAuth', val)}
											className="mr-3 h-4 w-7"
											thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
										/>
									</Row>
								)}
							</div>
						</div>
						<Row>
							<RowLabel>Optional</RowLabel>
							<Switch
								checked={rel.optional}
								onCheckedChange={(val) => updateField('optional', val)}
								className="mr-3 h-4 w-7"
								thumbClassName="bg-popover w-3 h-3 data-[state=checked]:translate-x-3"
							/>
						</Row>

						{rel.type === 'manyToMany' && (
							<div className="flex h-10 items-center px-1">
								<Button
									variant="outline"
									size="xs"
									className="w-full"
									onClick={() => split()}
									disabled={!targetModel || !sourceModel}
								>
									Expose joining table
								</Button>
							</div>
						)}

						{rel.type === 'oneToOne' && (
							<>
								<RowGap />

								<div className="flex items-center justify-between bg-accent px-3 py-2 pr-1">
									<div className="text-xs font-medium italic text-accent-foreground">
										{sourceModel?.name || 'source'} has a{' '}
										{singular(targetModel?.name.toLowerCase() || 'target')}Id field
									</div>
									<Button
										variant="outline"
										size="icon-tiny"
										className="-my-2 text-xs"
										onClick={() => swap()}
										disabled={!targetModel || !sourceModel}
									>
										<RepeatIcon className="h-3 w-3" />
									</Button>
								</div>
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>

			<Handle type="source" position={Position.Right} id={`${rel.id}-r`} className="opacity-0" />
			<Handle type="source" position={Position.Left} id={`${rel.id}-l`} className="opacity-0" />
			<Handle type="target" position={Position.Right} id={`${rel.id}-target-r`} className="opacity-0" />
			<Handle type="target" position={Position.Left} id={`${rel.id}-target-l`} className="opacity-0" />

			{/* {mode === 'source' ? (
				<>
					<Handle type="source" position={Position.Right} id={`${rel.id}-r`} className="opacity-0" />
					<Handle type="source" position={Position.Left} id={`${rel.id}-l`} className="opacity-0" />
				</>
			) : (
				<>
					<Handle type="target" position={Position.Right} id={`${rel.id}-target-r`} className="opacity-0" />
					<Handle type="target" position={Position.Left} id={`${rel.id}-target-l`} className="opacity-0" />
				</>
			)} */}
		</div>
	)
}
