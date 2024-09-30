import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { createEditor, Descendant, Node } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const serialize = (nodes: Node[]) => nodes.map((n) => Node.string(n)).join('\n')

type TextareaProps = {
	value: string
	onValueChange: (value: string) => void
	placeholder?: string
	className?: string
}

type ParagraphElement = {
	type: 'paragraph'
	align?: string
	children: Descendant[]
}

const Textarea = ({ value, onValueChange, placeholder, className }: TextareaProps) => {
	const editor = useMemo(() => withReact(createEditor()), [])

	const initialValue: ParagraphElement[] = [
		{
			type: 'paragraph',
			children: [{ text: value }],
		},
	]

	return (
		<Slate editor={editor} initialValue={initialValue} onValueChange={(val) => onValueChange(serialize(val))}>
			<Editable
				placeholder={placeholder}
				className={cn(
					'rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
			/>
		</Slate>
	)
}

export default Textarea
