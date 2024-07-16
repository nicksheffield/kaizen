import { AttrTypeRecommend } from '@/lib/ERDHelpers'
import type { Attribute, Model, Project, Relation } from './projectSchemas'
import { type Dispatch, RefObject, type SetStateAction, createContext, useContext } from 'react'
import { type Node } from '@xyflow/react'

export type ExtendedModel = Model & { attributes: Attribute[] }

type ERDContextType = {
	frameRef: RefObject<HTMLDivElement>
	project: Project
	nodes: Node<ExtendedModel>[]
	setNodes: Dispatch<SetStateAction<Node<ExtendedModel>[]>>
	addNode: (data?: Partial<Model>) => ExtendedModel
	relations: Relation[]
	setRelations: Dispatch<SetStateAction<Relation[]>>
	detailed: boolean
	setDetailed: Dispatch<SetStateAction<boolean>>
	showAuthAttributes: boolean
	setShowAuthAttributes: Dispatch<SetStateAction<boolean>>
	showConnections: boolean
	setShowConnections: Dispatch<SetStateAction<boolean>>
	showTypes: boolean
	setShowTypes: Dispatch<SetStateAction<boolean>>
	attrTypeRecommends: AttrTypeRecommend[]
	focusOn: (node: Node<Model>) => void
	userModelId: string
	setUserModelId: (id: string) => void
	modalHasPopover: string | null
	setModalHasPopover: Dispatch<SetStateAction<string | null>>
	isDirty: boolean
	conflicts: string[]
	reset: () => void
	save: () => void
}

export const ERDContext = createContext({} as ERDContextType)

export const useERDContext = () => useContext(ERDContext)
