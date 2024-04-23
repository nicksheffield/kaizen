import { useEffect, useRef } from 'react'
import { useTheme } from '../lib/ThemeContext'
import { Editor, Monaco, OnMount } from '@monaco-editor/react'

const monacoLang: Record<string, string> = {
	json: 'json',
	prettierrc: 'json',
	js: 'javascript',
	ts: 'typescript',
	tsx: 'typescript',
	yml: 'yaml',
	html: 'html',
	css: 'css',
	scss: 'scss',
	md: 'markdown',
	txt: 'plaintext',
}

type MonacoEditorProps = {
	value: string
	onValueChange: (val: string) => void
	extension?: string
	readonly?: boolean
}

export const MonacoEditor = ({ value, onValueChange, extension, readonly = false }: MonacoEditorProps) => {
	const { resolvedTheme } = useTheme()
	const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
	const monacoRef = useRef<Monaco | null>(null)

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor
		monacoRef.current = monaco

		monaco.editor.defineTheme('dark', {
			base: 'vs-dark',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#020817',
				'editor.lineHighlightBackground': '#1e293b',
			},
		})

		monaco.editor.setTheme(resolvedTheme === 'dark' ? 'dark' : 'vs')

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			experimentalDecorators: true,
			allowSyntheticDefaultImports: true,
			jsx: monaco.languages.typescript.JsxEmit.React,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			allowNonTsExtensions: true,
			target: monaco.languages.typescript.ScriptTarget.ES2020,
		})
	}

	const prevTheme = useRef<string | undefined>(resolvedTheme)
	useEffect(() => {
		if (prevTheme.current !== resolvedTheme) {
			monacoRef.current?.editor.setTheme(resolvedTheme === 'dark' ? 'dark' : 'vs')
			prevTheme.current = resolvedTheme
		}
	}, [resolvedTheme])

	const defaultLanguage = extension ? monacoLang[extension] || 'plaintext' : 'plaintext'

	return (
		<Editor
			height="90vh"
			defaultLanguage={defaultLanguage}
			value={value}
			onChange={(val) => {
				onValueChange(val || '')
			}}
			onMount={handleEditorDidMount}
			options={{
				readOnly: readonly,
			}}
		/>
	)
}
