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
	className?: string
	height?: string
}

export const MonacoEditor = ({
	value,
	onValueChange,
	extension,
	readonly = false,
	className,
	height = '90vh',
}: MonacoEditorProps) => {
	const { resolvedTheme } = useTheme()
	const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
	const monacoRef = useRef<Monaco | null>(null)

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor
		monacoRef.current = monaco

		monaco.editor.defineTheme('light', {
			base: 'vs',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#ffffff',
				'editor.lineHighlightBackground': '#e4e4e7',
			},
		})

		monaco.editor.defineTheme('dark', {
			base: 'vs-dark',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#020817',
				'editor.lineHighlightBackground': '#1c202e',
			},
		})

		monaco.editor.setTheme(resolvedTheme === 'dark' ? 'dark' : 'light')

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			experimentalDecorators: true,
			allowSyntheticDefaultImports: true,
			jsx: monaco.languages.typescript.JsxEmit.React,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			allowNonTsExtensions: true,
			target: monaco.languages.typescript.ScriptTarget.ES2020,
		})

		monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: true,
			noSyntaxValidation: true,
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
			height={height}
			defaultLanguage={defaultLanguage}
			value={value}
			onChange={(val) => {
				onValueChange(val || '')
			}}
			className={className}
			onMount={handleEditorDidMount}
			options={{
				readOnly: readonly,
			}}
		/>
	)
}
