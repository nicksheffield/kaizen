import { useERDContext, ExtendedModel } from './ERDContext'
import { useCallback, useState } from 'react'

export const useModelField = (id: string, field: keyof ExtendedModel): [string, (x: string) => void] => {
	const { nodes, setNodes } = useERDContext()

	const model = nodes.find((n) => n.id === id)?.data

	const [state, updateState] = useState<string>(model?.[field] as string)

	const setState = useCallback(
		(value: string) => {
			updateState(value)
			setNodes((prev) => {
				return prev.map((x) => {
					return x.id === id ? { ...x, data: { ...x.data, [field]: value } } : x
				})
			})
		},
		[field, id, setNodes]
	)

	return [state, setState]
}
