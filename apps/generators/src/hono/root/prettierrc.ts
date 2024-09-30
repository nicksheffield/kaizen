const tmpl = () => {
	const useTabs = true
	const tabWidth = 4
	const semi = false
	const printWidth = 80

	const prettierRc = {
		tabWidth,
		useTabs,
		singleQuote: true,
		semi,
		printWidth,
		trailingComma: 'es5',
		arrowParens: 'always',
	}

	return JSON.stringify(prettierRc, null, 4)
}

export default tmpl
