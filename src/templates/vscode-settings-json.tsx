const tmpl = () => {
	const object = {
		'typescript.tsdk': 'app/node_modules/typescript/lib',
		'typescript.enablePromptUseWorkspaceTsdk': true,
	}

	return JSON.stringify(object, null, 4)
}

export default tmpl
