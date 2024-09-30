import { Project } from 'common/src'

export type ProjectCtx = Project

export type HonoGeneratorExtras = {
	seeder: boolean
	api: boolean
	queries: boolean
	emails: string[]
}

export type HonoGeneratorFn = (
	project: ProjectCtx,
	extras: HonoGeneratorExtras
) => Promise<Record<string, string>>
