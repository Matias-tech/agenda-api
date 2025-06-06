import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { validationMiddleware } from './middleware/validation'
import routes from './routes'
import test from './routes/test'
import { Env } from './types'
import { handleScheduledReminders } from './services/reminderService'

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
      emails: '/api/emails',
      testForms: '/form-preview'
    }
  })
})

export default {
  fetch: app.fetch,

  // Cron job para enviar recordatorios diarios
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (controller.cron) {
      case '0 18 * * *': // Todos los días a las 6:00 PM
        console.log('🕕 Ejecutando envío de recordatorios...')
        try {
          const response = await handleScheduledReminders(env)
          const result = await response.json()
          console.log('📧 Recordatorios completados:', result)
        } catch (error) {
          console.error('❌ Error en cron job de recordatorios:', error)
        }
        break
      default:
        console.log('⚠️ Cron job no reconocido:', controller.cron)
    }
  },
}