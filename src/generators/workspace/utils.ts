import prettier from 'prettier'
import typescriptPlugin from 'prettier/plugins/typescript'
import estreePlugin from 'prettier/plugins/estree'

export const format = async (content: string, settings: Partial<prettier.Options> = {}) => {
	try {
		const result = await prettier.format(content, {
			tabWidth: 4,
			useTabs: true,
			singleQuote: true,
			semi: false,
			printWidth: 80,
			trailingComma: 'es5',
			arrowParens: 'always',
			parser: 'typescript',
			...settings,
			plugins: [estreePlugin, typescriptPlugin],
		})
		return result
	} catch (e) {
		console.log(e)
		return `/* unformatted */
${content}`
	}
}
