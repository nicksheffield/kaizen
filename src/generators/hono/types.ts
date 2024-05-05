import { Project } from '@/lib/projectSchemas'

export type ProjectCtx = Project

export type HonoGeneratorExtras = {
	seeder: string | undefined
	emails: Record<string, string>
}

export type HonoGeneratorFn = (project: ProjectCtx, extras: HonoGeneratorExtras) => Promise<Record<string, string>>
