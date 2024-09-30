import { useERDContext } from '@/lib/ERDContext'
import { Attribute } from 'common/src'
import { useCallback, useState } from 'react'

export const useAttrField = (
	modelId: string,
	attrId: string,
	field: keyof Attribute
): [string | null, (x: string | null) => void] => {
	const { nodes, setNodes } = useERDContext()

	const model = nodes.find((n) => n.id === modelId)?.data
	const attr = model?.attributes.find((a) => a.id === attrId)

	const [state, updateState] = useState<string | null>(attr?.[field] as string)

	const setState = useCallback(
		(value: string | null) => {
			updateState(value)
			setNodes((prev) => {
				return prev.map((x) => {
					return x.id === modelId
						? {
								...x,
								data: {
									...x.data,
									attributes: x.data.attributes.map((a) => {
										return a.id === attrId ? { ...a, [field]: value } : a
									}),
								},
							}
						: x
				})
			})
		},
		[attrId, field, modelId, setNodes]
	)

	return [state, setState]
}
