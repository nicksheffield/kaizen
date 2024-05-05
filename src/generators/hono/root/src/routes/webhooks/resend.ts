const tmpl = () => `import { db } from '../../lib/db.js'
import { emailLogs } from '../../schema.js'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { Webhook } from 'svix'
import { env } from '../../lib/env.js'

const secret = env.RESEND_WEBHOOK_SECRET

const resendEvent = z.object({
	created_at: z.string(),
	data: z.object({
		email_id: z.string(),
	}),
	type: z.union([
		z.literal('email.sent'),
		z.literal('email.delivered'),
		z.literal('email.delivery_delayed'),
		z.literal('email.bounced'),
	]),
})

export const router = new Hono()

router.post('/resend', async (c) => {
	if (!secret) return c.json({ message: 'webook secret not set' }, 401)

	// https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests#why-should-i-verify-webhooks
	const wh = new Webhook(secret)

	const payload = wh.verify(await c.req.text(), {
		'svix-id': c.req.header('svix-id') || '',
		'svix-timestamp': c.req.header('svix-timestamp') || '',
		'svix-signature': c.req.header('svix-signature') || '',
	})

	const parsedEvent = resendEvent.safeParse(payload)

	if (parsedEvent.success) {
		const set = ((event: z.infer<typeof resendEvent>) => {
			const date = new Date(event.created_at)
			const type = event.type

			if (type === 'email.sent') return { sent: date }
			if (type === 'email.delivered') return { delivered: date }
			if (type === 'email.delivery_delayed') return { delayed: date }
			if (type === 'email.bounced') return { bounced: date }
			return {}
		})(parsedEvent.data)

		await db
			.update(emailLogs)
			.set(set)
			.where(eq(emailLogs.resendId, parsedEvent.data.data.email_id))
	}

	return c.body(null, 204)
})

`

export default tmpl
