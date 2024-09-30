const tmpl = () => {
	return `import { Hono } from 'hono'
	
	export const router = new Hono()
	
	// router.get('/example', async (c) => {
	// 	return c.json({ message: 'Hello World' })
	// })
	
	// router.get('/example-auth', authenticate, async (c) => {
	// 	return c.json({ message: 'You are logged in', user: c.get('user') })
	// })
	`
}

export default tmpl
