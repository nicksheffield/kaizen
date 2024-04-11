'use client'

import { useCallback, useMemo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { alphabetical, camelize, cn, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LinkIcon, Trash2Icon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useERDContext } from '@/lib/ERDContext'
import { plural, singular } from 'pluralize'
import { PanelRow, SwitchPanelRow } from './PanelRow'
import { RelationType, type Model, type Relation } from '@/lib/projectSchemas'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getSourceName, getTargetName } from '@/lib/ERDHelpers'

type Mode = 'source' | 'target'

type RelationRowProps = {
	rel: Relation
	model: Model
	mode: Mode
}

// const zoomSelector = (s: ReactFlowState) => s.transform[2]

export const RelationRow = ({ rel, model, mode }: RelationRowProps) => {
	const { nodes, relations, setRelations, addNode, focusOn, userModelId } = useERDContext()
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

	const [open, setOpen] = useState(false)

	return (
		<div key={rel.id} className="relative flex flex-col px-2" ref={setNodeRef} style={style}>
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
							<LinkIcon
								className={cn(
									'h-4 w-4 cursor-grab opacity-25 active:cursor-grabbing',
									open && 'opacity-75'
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
										!targetModel?.enabled && 'text-muted-foreground'
									)}
								>
									{name}
								</div>
							) : (
								<div
									className={cn('text-xs italic text-destructive', open && 'text-primary-foreground')}
								>
									New Relationship
								</div>
							)}{' '}
						</div>
						<div
							className={cn('font-mono text-xs opacity-50 hover:text-primary', open && 'opacity-100')}
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

				<PopoverContent align="center" side="right">
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between pb-3">
							<div>Relationship Settings</div>

							<Button variant="ghost" size="xs" onClick={removeSelf}>
								<Trash2Icon className="h-4 w-4" />
							</Button>
						</div>

						<div className="rounded-md border bg-accent px-2 py-1">
							<div className="text-xs font-medium italic text-accent-foreground">{sourceDescription}</div>
						</div>

						<PanelRow label="Model">
							<Select
								value={sourceModel?.id}
								onValueChange={(id) => {
									const source = nodes.find((x) => x.data.id === id)?.data
									if (!source) return

									updateField('sourceId', source.id)
								}}
								disabled={sourceLocked}
							>
								<SelectTrigger className="h-8 px-2 py-1 text-sm">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>

								<SelectContent position="item-aligned">
									{nodes
										.map((x) => x.data)
										.slice()
										.sort((a, b) => alphabetical(a.name, b.name))
										.map((x) => (
											<SelectItem key={x.id} value={x.id}>
												{x.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</PanelRow>

						<PanelRow label="Alias">
							<Input
								value={rel.sourceName || ''}
								onChange={(e) => updateField('sourceName', e.currentTarget.value)}
								size="sm"
							/>
						</PanelRow>

						<PanelRow label="Cardinality">
							<Tabs
								value={sourceCardinality}
								onValueChange={(sourceCardinality) => {
									if (sourceCardinality === 'one') {
										updateField('type', targetCardinality === 'one' ? 'oneToOne' : 'oneToMany')
									} else {
										updateField('type', targetCardinality === 'one' ? 'manyToOne' : 'manyToMany')
									}
								}}
							>
								<TabsList>
									<TabsTrigger value="one">One</TabsTrigger>
									<TabsTrigger value="many">Many</TabsTrigger>
								</TabsList>
							</Tabs>
						</PanelRow>

						{rel.sourceId === userModelId && (
							<SwitchPanelRow
								label="Default to Auth"
								hint="If set to true, the authenticated user's id will be the default value"
								checked={rel.sourceDefaultToAuth}
								onCheckedChange={(val) => updateField('sourceDefaultToAuth', val)}
							/>
						)}

						<Separator className="my-4" />

						<div className="rounded-md border bg-accent px-2 py-1">
							<div className="text-xs font-medium italic text-accent-foreground">{targetDescription}</div>
						</div>

						<PanelRow label="Model">
							<Select
								value={targetModel?.id}
								onValueChange={(id) => {
									const target = nodes.find((x) => x.data.id === id)?.data
									if (!target) return

									updateField('targetId', target.id)
								}}
								disabled={targetLocked}
							>
								<SelectTrigger className="h-8 px-2 py-1 text-sm">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>

								<SelectContent position="item-aligned" autoFocus>
									{nodes
										.map((x) => x.data)
										.slice()
										.sort((a, b) => alphabetical(a.name, b.name))
										.map((x) => (
											<SelectItem key={x.id} value={x.id}>
												{x.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</PanelRow>

						<PanelRow label="Alias">
							<Input
								value={rel.targetName || ''}
								onChange={(e) => updateField('targetName', e.currentTarget.value)}
								size="sm"
							/>
						</PanelRow>

						<PanelRow label="Cardinality">
							<Tabs
								value={targetCardinality}
								onValueChange={(targetCardinality) => {
									if (targetCardinality === 'one') {
										updateField('type', sourceCardinality === 'one' ? 'oneToOne' : 'manyToOne')
									} else {
										updateField('type', sourceCardinality === 'one' ? 'oneToMany' : 'manyToMany')
									}
								}}
							>
								<TabsList>
									<TabsTrigger value="one">One</TabsTrigger>
									<TabsTrigger value="many">Many</TabsTrigger>
								</TabsList>
							</Tabs>
						</PanelRow>

						{rel.targetId === userModelId && (
							<SwitchPanelRow
								label="Default to Auth"
								hint="If set to true, the authenticated user's id will be the default value"
								checked={rel.targetDefaultToAuth}
								onCheckedChange={(val) => updateField('targetDefaultToAuth', val)}
							/>
						)}

						<Separator className="mb-2 mt-4" />

						<SwitchPanelRow
							label="Optional"
							checked={rel.optional}
							onCheckedChange={(val) => updateField('optional', val)}
						/>

						<SwitchPanelRow
							label="Enabled"
							hint="If set to false, this relationship will be omitted from the generated app and db schema"
							checked={rel.enabled}
							onCheckedChange={(val) => updateField('enabled', val)}
						/>

						{rel.type === 'manyToMany' && (
							<Button
								variant="outline"
								size="xs"
								className="w-full"
								onClick={() => split()}
								disabled={!targetModel || !sourceModel}
							>
								Expose joining table
							</Button>
						)}

						{rel.type === 'oneToOne' && (
							<>
								<Separator className="mb-2 mt-2" />

								<div className="rounded-md border bg-accent px-2 py-1">
									<div className="text-xs font-medium italic text-accent-foreground">
										{sourceModel?.name || 'source'} has a{' '}
										{singular(targetModel?.name.toLowerCase() || 'target')}Id field
									</div>
								</div>

								<Button
									variant="outline"
									size="xs"
									className="w-full"
									onClick={() => swap()}
									disabled={!targetModel || !sourceModel}
								>
									Swap foreign keys
								</Button>
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
