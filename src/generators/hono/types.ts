import { Project } from '@/lib/projectSchemas'

export type ProjectCtx = Project

export type HonoGeneratorExtras = {
	seeder: boolean
	api: boolean
	emails: string[]
}

export type HonoGeneratorFn = (project: ProjectCtx, extras: HonoGeneratorExtras) => Promise<Record<string, string>>
