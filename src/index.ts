import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { validationMiddleware } from './middleware/validation'
import routes from './routes'
import test from './routes/test'
import { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.use('*', authMiddleware)
app.use('*', validationMiddleware)

app.route('/api', routes)
app.route('/form-preview', test)

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to the Appointment API!',
    version: '1.0.0',
    endpoints: {
      appointments: '/api/appointments',
      availability: '/api/availability',
      testForms: '/form-preview'
    }
  })
})

export default app