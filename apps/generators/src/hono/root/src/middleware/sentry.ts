const tmpl = () => {
	return `import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { MiddlewareHandler } from 'hono'
import { env } from 'lib/env.js'

// Ensure to call this before importing any other modules!
const nodeClient = Sentry.init({
	dsn: env.SENTRY_DSN,

	integrations: [
		// Add our Profiling integration
		nodeProfilingIntegration(),
	],

	// Add Tracing by setting tracesSampleRate
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,

	// Set sampling rate for profiling
	// This is relative to tracesSampleRate
	profilesSampleRate: 1.0,
})

export const sentry: MiddlewareHandler = async (c, next) => {
	if (!nodeClient) return next()

	try {
		Sentry.setContext('executionCtx', c.executionCtx)
	} catch {}

	await next()

	if (c.error) {
		nodeClient.captureException(c.error)
	}
}
`
}

export default tmpl
