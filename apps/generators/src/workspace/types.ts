import { Project } from '@/lib/projectSchemas'

export type WorkspaceGeneratorFn = (context: { project?: Project; name?: string }) => Promise<Record<string, string>>

export type ProjectCtx = Project
