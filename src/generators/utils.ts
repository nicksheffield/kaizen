export const clean = (strings: TemplateStringsArray, ...values: any[]) => {
	let result = ''

	for (let i = 0; i < strings.length; i++) {
		result += strings[i]

		if (i < values.length && values[i] !== null && values[i] !== undefined && values[i] !== false) {
			result += values[i]
		}
	}

	return result
}
