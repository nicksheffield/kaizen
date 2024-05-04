import { Project } from '@/lib/projectSchemas'

export type ProjectCtx = Project

export type HonoGeneratorFn = (
	project: ProjectCtx,
	extras: {
		seeder: string | undefined
		emails: Record<string, string>
	}
) => Promise<Record<string, string>>
