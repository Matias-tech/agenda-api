import { Hono } from 'hono'

export const authMiddleware = async (c, next) => {
  const token = c.req.headers.get('Authorization')

  if (!token || token !== 'your-secret-token') {
    return c.text('Unauthorized', 401)
  }

  await next()
}