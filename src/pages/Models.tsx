import { Controls } from '@/components/ERD/Controls'
import { ModelNode } from '@/components/ERD/ModelNode'
import { SimpleFloatingEdge } from '@/components/ERD/SimpleFloatingEdge'
import { ERDMarkers } from '@/components/ERDMarkers'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { useERDContext } from '@/lib/ERDContext'
import { getAttrTypeRecommends, getSourceName, getTargetName, isReservedKeyword } from '@/lib/ERDHelpers'
import { AttributeType, Model, Relation } from '@/lib/projectSchemas'
import { generateId, getUserModelFields, roundToNearest } from '@/lib/utils'
import {
	Node,
	NodeChange,
	ReactFlow,
	ReactFlowProvider,
	SmoothStepEdge,
	applyNodeChanges,
	useReactFlow,
	useStore,
} from '@xyflow/react'
import { ComponentProps, useCallback, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { ERDProvider } from '../components/ERDProvider'

const PatchedSmoothStepEdge = (props: ComponentProps<typeof SmoothStepEdge>) => {
	const { showConnections } = useERDContext()

	if (!showConnections) return null

	return <SmoothStepEdge {...props} />
}

// https://github.com/xyflow/xyflow/issues/3030#issuecomment-1694349380
function applyNodeChangesWithTypes(changes: NodeChange[], nodes: Node<Model>[]) {
	// @ts-ignore
	return applyNodeChanges(changes, nodes) as unknown as CustomNode[]
}

const snapSize = 24

export const ERDEditor = () => {
	const project = useApp((v) => v.project)
	const draft = useApp((v) => v.draft)
	const setDraft = useApp((v) => v.setDraft)
	const saveProject = useApp((v) => v.saveProject)

	const [defaultModels, setDefaultModels] = useState(draft?.content.models || [])
	const [defaultRelations, setDefaultRelations] = useState(draft?.content.relations || [])

	const [nodes, setNodes] = useState<Node<Model>[]>(
		draft?.content.models.map((model) => ({
			id: model.id,
			type: 'model',
			position: { x: model.posX, y: model.posY },
			dragHandle: '.drag-handle',
			data: model,
			draggable: true,
		})) || []
	)

	const nodeTypes = useMemo(() => ({ model: ModelNode }), [])
	const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge, smooth: PatchedSmoothStepEdge }), [])

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => setNodes((nds) => applyNodeChangesWithTypes(changes, nds)),
		[]
	)

	const flow = useReactFlow()

	const wrapperRef = useRef<HTMLDivElement>(null)

	const [relations, setRelations] = useState<Relation[]>(draft?.content.relations || [])
	const edges = useMemo(() => {
		return [...relations].map((rel) => {
			const markerStart = (() => {
				if (rel.type === 'oneToOne' || rel.type === 'oneToMany') {
					return rel.optional ? 'hasOne' : 'hasOneRequired'
				}
				if (rel.type === 'manyToMany' || rel.type === 'manyToOne') {
					return 'hasMany'
					// return rel.optional ? 'hasMany' : 'hasManyRequired' // when is hasManyRequired realistic?
				}
			})()

			const markerEnd = (() => {
				if (rel.type === 'oneToOne' || rel.type === 'manyToOne') {
					return rel.optional ? 'hasOne' : 'hasOneRequired'
				}
				if (rel.type === 'oneToMany' || rel.type === 'manyToMany') {
					return 'hasMany'
					// return rel.optional ? 'hasMany' : 'hasManyRequired' // when is hasManyRequired realistic?
				}
			})()

			return {
				id: rel.id,
				source: rel.sourceId,
				sourceHandle: `${rel.id}-${rel.sourceId}-l`,
				target: rel.targetId,
				targetHandle: `${rel.id}-${rel.targetId}-target-r`,
				// type: 'floating', // gotta fix this...
				type: 'smooth',
				markerStart,
				markerEnd,
				data: rel,
			}
		})
	}, [relations])

	const addNode = (data?: Partial<Model>) => {
		const rect = wrapperRef.current?.getBoundingClientRect()

		const position = flow.screenToFlowPosition({
			x: (rect?.x || 0) + (rect?.width || 0) / 2,
			y: (rect?.y || 0) + (rect?.height || 0) / 3,
		})

		position.x = position.x - 214 / 2

		let foundSamePos = nodes.find((x) => x.position.x === position.x && x.position.y === position.y)
		while (foundSamePos) {
			position.x += snapSize
			position.y += snapSize
			foundSamePos = nodes.find((x) => x.position.x === position.x && x.position.y === position.y)
		}

		position.x = roundToNearest(position.x, snapSize)
		position.y = roundToNearest(position.y, snapSize)

		const id = generateId()

		const model: Model = {
			id,
			name: '',
			key: '',
			tableName: '',
			posX: position.x,
			posY: position.y,
			auditDates: true,
			enabled: true,
			...data,
			attributes: [
				{
					id: generateId(),
					name: 'id',
					type: AttributeType.id,
					order: 0,
					modelId: id,
					nullable: false,
					selectable: true,
					insertable: true,
					enabled: true,
					default: null,
				},
			],
		}

		setNodes((nds) => [
			...nds,
			{
				id,
				type: 'model',
				position,
				dragHandle: '.drag-handle',
				data: model,
				draggable: true,
				width: 214,
			},
		])

		return model
	}

	const reset = () => {
		if (!project) return

		setDraft({ dirty: false, content: project })

		setNodes(
			project.models.map((model) => ({
				id: model.id,
				type: 'model',
				position: { x: model.posX, y: model.posY },
				dragHandle: '.drag-handle',
				data: model,
				draggable: true,
			}))
		)

		setRelations(defaultRelations)
	}

	const [detailed, setDetailed] = useLocalStorage(`project-${project?.settings.id}-erd-detailed`, false)
	const [showAuthAttributes, setShowAuthAttributes] = useLocalStorage(
		`project-${project?.settings.id}-show-auth-attributes`,
		false
	)
	const [showConnections, setShowConnections] = useLocalStorage(
		`project-${project?.settings.id}-erd-showConnections`,
		true
	)
	const [showTypes, setShowTypes] = useLocalStorage(`project-${project?.settings.id}-erd-showTypes`, false)

	const [modalHasPopover, setModalHasPopover] = useState<string | null>(null)

	const isDirty = useMemo(() => {
		const models = nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y }))
		const attributes = models.flatMap((x) => x.attributes)
		const defaultAttributes = defaultModels.flatMap((x) => x.attributes)

		for (const model of models) {
			const original = defaultModels.find((x) => x.id === model.id)
			if (!original) return true

			if (model.name !== original.name) return true
			if (model.key !== original.key) return true
			if (model.tableName !== original.tableName) return true
			if (model.auditDates !== original.auditDates) return true
			if (model.posX !== original.posX) return true
			if (model.posY !== original.posY) return true
			if (model.enabled !== original.enabled) return true
			if (model.displaySql !== original.displaySql) return true
		}

		for (const originalModel of defaultModels) {
			const model = models.find((x) => x.id === originalModel.id)
			if (!model) return true
		}

		for (const relation of relations) {
			const original = defaultRelations.find((x) => x.id === relation.id)
			if (!original) return true

			if (relation.type !== original.type) return true
			if (relation.sourceId !== original.sourceId) return true
			if (relation.targetId !== original.targetId) return true
			if (relation.sourceOrder !== original.sourceOrder) return true
			if (relation.targetOrder !== original.targetOrder) return true
			if (relation.sourceName !== original.sourceName) return true
			if (relation.targetName !== original.targetName) return true
			if (relation.optional !== original.optional) return true
			if (relation.enabled !== original.enabled) return true
			if (relation.sourceDefaultToAuth !== original.sourceDefaultToAuth) return true
			if (relation.targetDefaultToAuth !== original.targetDefaultToAuth) return true
		}

		for (const originalRelation of defaultRelations) {
			const relation = relations.find((x) => x.id === originalRelation.id)
			if (!relation) return true
		}

		for (const attr of attributes) {
			const original = defaultAttributes.find((x) => x.id === attr.id)
			if (!original) return true

			if (attr.name !== original.name) return true
			if (attr.type !== original.type) return true
			if (attr.order !== original.order) {
				return true
			}
			if (attr.nullable !== original.nullable) return true
			if (attr.selectable !== original.selectable) return true
			if (attr.insertable !== original.insertable) return true
			if (attr.default !== original.default) return true
			if (attr.enabled !== original.enabled) return true
			if (attr.generated !== original.generated) return true
			if (attr.generatedSql !== original.generatedSql) return true
		}

		for (const originalAttr of defaultAttributes) {
			const attr = attributes.find((x) => x.id === originalAttr.id)
			if (!attr) return true
		}

		return false
	}, [defaultModels, defaultRelations, nodes, relations])

	const conflicts = useMemo(() => {
		const messages: string[] = []

		const models = nodes.map((x) => x.data)

		const modelNameConflicts = models.some((x) => models.some((y) => y.id !== x.id && y.name === x.name))

		const attributes = models.flatMap((x) => x.attributes)
		const attributeNameConflicts = attributes.some((x) =>
			attributes.filter((y) => y.modelId === x.modelId).some((y) => y.id !== x.id && y.name === x.name)
		)

		const relationNameConflicts = relations.some((x) => {
			return relations.some((y) => {
				if (y.id === x.id) return false

				if (y.sourceId === x.sourceId) getTargetName(y, nodes) === getTargetName(x, nodes)
				if (y.targetId === x.targetId) getSourceName(y, nodes) === getSourceName(x, nodes)
			})
		})

		const attributeRelationNameConflicts = relations.some((x) => {
			return attributes.some((y) => {
				if (y.modelId === x.sourceId) return y.name === getTargetName(x, nodes)
				if (y.modelId === x.targetId) return y.name === getSourceName(x, nodes)
			})
		})

		if (modelNameConflicts || attributeNameConflicts || relationNameConflicts || attributeRelationNameConflicts) {
			messages.push('You have naming conflicts')
		}

		const incompleteRelations = relations.some((x) => !x.sourceId || !x.targetId)

		if (incompleteRelations) {
			messages.push('You have incomplete relationships')
		}

		const unnamedModels = models.some((x) => !x.name)

		if (unnamedModels) {
			messages.push('You have unnamed models')
		}

		if (models.some((x) => isReservedKeyword(x.name, true))) {
			messages.push('You have models with reserved keywords as names')
		}

		const unnamedAttrs = attributes.some((x) => !x.name)

		if (unnamedAttrs) {
			messages.push('You have unnamed attributes')
		}

		if (attributes.some((x) => isReservedKeyword(x.name))) {
			messages.push('You have attributes with reserved keywords as names')
		}

		const autoIncrementAttrs = attributes.filter((x) => x.type === AttributeType.a_i)

		for (const attr of autoIncrementAttrs) {
			const otherAttr = attributes.find(
				(x) => x.modelId === attr.modelId && x.id !== attr.id && x.type === AttributeType.a_i
			)
			if (otherAttr) {
				const model = models.find((x) => x.id === attr.modelId)
				const message = `${model?.name || 'A model'} has multiple auto-increment attributes`
				if (!messages.includes(message)) messages.push(message)
			}
		}

		return messages
	}, [nodes, relations])

	const attrTypeRecommends = useMemo(() => getAttrTypeRecommends(project), [project])

	const selectNodes = useStore((actions) => actions.addSelectedNodes)

	const focusOn = (node: Node<Model>) => {
		flow.fitView({ padding: 0.2, includeHiddenNodes: true, nodes: [node], duration: 400 })
		selectNodes([node.id])
	}

	const save = () => {
		if (!project) return

		saveProject({
			...project,
			settings: {
				...project.settings,
				userModelId,
			},
			models: nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y })),
			relations,
		})

		setDefaultModels(nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y })))
		setDefaultRelations(relations)
	}

	const [userModelId, setUserModelId] = useState(project?.settings.userModelId || '')

	const updateUserModelId = (id: string) => {
		setUserModelId(id)
		const newAttrs = getUserModelFields(id, {
			hasMagicLink: project?.settings.auth.enableMagicLink || false,
		})

		setNodes((nds) => {
			return nds.map((x) => {
				if (x.data.id === id) {
					return {
						...x,
						data: {
							...x.data,
							attributes: [...x.data.attributes, ...newAttrs],
						},
					}
				}

				return x
			})
		})
	}

	const ref = useRef<HTMLDivElement>(null)

	if (!project) return null

	return (
		<ERDProvider
			value={{
				frameRef: ref,
				project,
				nodes,
				setNodes,
				addNode,
				relations,
				setRelations,
				showConnections,
				setShowConnections,
				showTypes,
				setShowTypes,
				detailed,
				setDetailed,
				showAuthAttributes,
				setShowAuthAttributes,
				attrTypeRecommends,
				focusOn,
				userModelId,
				setUserModelId: updateUserModelId,
				modalHasPopover,
				setModalHasPopover,
				reset,
				save,
				isDirty,
				conflicts,
			}}
		>
			<div ref={wrapperRef} className="relative flex flex-1 flex-col">
				{nodes.length === 0 && (
					<div className="absolute inset-0 z-10">
						<div className="flex h-full flex-col items-center justify-center">
							<div className="text-sm text-muted-foreground">Add a model to get started</div>
							<Button
								variant="default"
								className="mt-4"
								onClick={() => {
									addNode()
								}}
							>
								Add Model
							</Button>
						</div>
					</div>
				)}

				<Controls />

				<ERDMarkers />

				<ReactFlow
					ref={ref}
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					snapToGrid
					snapGrid={[snapSize, snapSize]}
					zoomOnDoubleClick={false}
					edgesReconnectable={false}
					fitView={true}
					maxZoom={1}
					minZoom={0.1}
					deleteKeyCode={null}
					elevateNodesOnSelect
					className="h-full w-full"
				>
					{/* <Background
						gap={12}
						size={1}
						variant={BackgroundVariant.Dots}
						color="currentColor"
						className="bg-muted/10 text-foreground/20"
					/> */}
				</ReactFlow>
			</div>
		</ERDProvider>
	)
}

export const Models = () => {
	return (
		<ReactFlowProvider>
			<ERDEditor />
		</ReactFlowProvider>
	)
}
