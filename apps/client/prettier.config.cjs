/** @type {import("prettier").Config} */
const config = {
	tabWidth: 4,
	useTabs: true,
	singleQuote: true,
	semi: false,
	printWidth: 120,
	trailingComma: 'es5',
	arrowParens: 'always',
	plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
