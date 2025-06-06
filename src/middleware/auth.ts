import { Context, Next } from 'hono'

export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')

  // Para desarrollo puedes comentar esta validación
  // if (!token || token !== 'Bearer your-secret-token') {
  //   return c.json({ error: 'Unauthorized' }, 401)
  // }

  await next()
}