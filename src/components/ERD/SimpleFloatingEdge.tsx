// https://reactflow.dev/docs/examples/edges/simple-floating-edges/
import { useERDContext } from '@/lib/ERDContext'
import { type EdgeProps, getSmoothStepPath, type Node, Position, useStore } from '@xyflow/react'
import { useCallback } from 'react'

type Dir = 'from' | 'to'

const getParams = (
	nodeA: Node,
	nodeB: Node,
	relId: string,
	dir: Dir
): [number | undefined, number | undefined, Position] => {
	const centerA = getNodeCenter(nodeA)
	const centerB = getNodeCenter(nodeB)

	const horizontalDiff = Math.abs(centerA.x - centerB.x)
	const verticalDiff = Math.abs(centerA.y - centerB.y)

	let position = Position.Right

	if (horizontalDiff > verticalDiff) {
		position = centerA.x > centerB.x ? Position.Left : Position.Right
	}

	const [x, y] = getHandleCoordsByPosition(nodeA, position, relId, dir)
	return [x, y, position]
}

const getHandleCoordsByPosition = (node: Node, handlePosition: Position, relId: string, dir: Dir) => {
	const handle = [
		// dunno if this is right
		...(node.handles?.filter((x) => x.position === handlePosition) || []),
		// ...(node[internalsSymbol]?.handleBounds?.source || []),
		// ...(node[internalsSymbol]?.handleBounds?.target || []),
	].find((h) => {
		if (handlePosition === Position.Left) {
			if (dir === 'from') return h.id === `${relId}-l`
			return h.id === `${relId}-target-l`
		} else if (handlePosition === Position.Right) {
			if (dir === 'from') return h.id === `${relId}-r`
			return h.id === `${relId}-target-r`
		}
	})

	let offsetX = (handle?.width || 0) / 2
	let offsetY = (handle?.height || 0) / 2

	switch (handlePosition) {
		case Position.Left:
			offsetX = handle?.width || 0
			break
		case Position.Right:
			offsetX = 0
			break
		case Position.Top:
			offsetY = 0
			break
		case Position.Bottom:
			offsetY = handle?.height || 0
			break
	}

	const x = (node.position?.x || 0) + (handle?.x || 0) + offsetX
	const y = (node.position?.y || 0) + (handle?.y || 0) + offsetY

	return [x, y]
}

const getNodeCenter = (node: Node) => {
	return {
		x: (node.position?.x || 0) + (node?.width || 0) / 2,
		y: (node.position?.y || 0) + (node?.height || 0) / 2,
	}
}

export const getEdgeParams = (source: Node, target: Node, relId: string) => {
	const [sx, sy, sourcePos] = getParams(source, target, relId, 'from')
	const [tx, ty, targetPos] = getParams(target, source, relId, 'to')

	return {
		sx,
		sy,
		tx,
		ty,
		sourcePos,
		targetPos,
	}
}

export const SimpleFloatingEdge = ({ id, source, target, markerEnd, markerStart, style, data }: EdgeProps) => {
	const { showConnections } = useERDContext()

	const sourceNode = useStore(useCallback((store) => store.nodeLookup.get(source), [source]))
	const targetNode = useStore(useCallback((store) => store.nodeLookup.get(target), [target]))
	const rel = useStore(useCallback((store) => store.edges.find((x) => x.id === id), [id]))

	if (!sourceNode || !targetNode) {
		return null
	}

	// console.log('sourceNode?.data', sourceNode?.data)

	const enabled =
		data?.enabled !== undefined && data?.enabled && sourceNode?.data?.enabled && targetNode?.data?.enabled

	// console.log(data?.enabled !== undefined, data?.enabled, sourceNode?.data?.enabled, targetNode?.data?.enabled)

	const extraClass = !enabled && 'relation-disabled'

	const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode, id)

	if (!sx || !sy || !tx || !ty) return <></>

	const [edgePath] = getSmoothStepPath({
		sourceX: sx,
		sourceY: sy,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX: tx,
		targetY: ty,
		borderRadius: 20,
		centerX: (tx + sx) / 2 + ((rel?.data?.sourceOrder as number) + 1) * -10 + 15,
		offset: 40,
	})

	if (!showConnections) return null

	return (
		<path
			id={id}
			className={['react-flow__edge-path', extraClass].filter((x) => !!x).join(' ')}
			d={edgePath}
			strokeWidth={2}
			markerEnd={markerEnd}
			markerStart={markerStart}
			style={style}
		/>
	)
}
