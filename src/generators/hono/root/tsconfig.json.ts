import { MODS_DIRNAME } from '@/lib/constants'

const tmpl = () => {
	const tsConfigJson = {
		$schema: 'https://json.schemastore.org/tsconfig',
		extends: '../../tsconfig.json',
		compilerOptions: {
			module: 'NodeNext',
			moduleResolution: 'NodeNext',
			allowJs: true,
			jsx: 'preserve',
			noEmit: true,
			baseUrl: 'src',
			paths: {
				[`${MODS_DIRNAME}/*`]: [`../../${MODS_DIRNAME}/*`],
			},
		},
		include: ['**/*.ts', '**/*.tsx'],
		exclude: ['node_modules'],
	}

	return JSON.stringify(tsConfigJson, null, 4).replaceAll(/[" "]{4}/g, '\t')
}

export default tmpl
