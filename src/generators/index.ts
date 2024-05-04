import * as hono from './hono'
import * as Hono from './hono/types'

export const generators = {
	hono: hono.generate,
} as const

export const generatorNames = Object.keys(generators)

export type HonoGeneratorFn = Hono.HonoGeneratorFn

export type GeneratorFn = HonoGeneratorFn
