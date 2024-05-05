import * as v1_0 from './v1.0'
import * as v2_0 from './v2.0'
import * as v3_0 from './v3.0'

export * from './v3.0'

export const projectVersion = 3

export const projectSchemas = [v1_0, v2_0, v3_0] as const

export const parseProject = (content: string) => {
	let project = JSON.parse(content)

	while (project.v < projectVersion) {
		const schema = projectSchemas[project.v]
		project = schema.upgrade(project)
	}

	// the index on projectSchemas needs to be projectVersion - 1
	const parsedProject = projectSchemas[2].ProjectSchema.parse(project)

	return parsedProject
}
