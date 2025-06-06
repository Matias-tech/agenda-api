import { Context, Next } from 'hono'
import { isValidEmail } from '../utils/helpers'

// Middleware general de validación
export const validationMiddleware = async (c: Context, next: Next) => {
  // Aquí puedes agregar validaciones generales que apliquen a todas las rutas
  // Por ejemplo, validar headers, formato de datos, etc.

  await next()
}

// Validaciones específicas para diferentes endpoints
export const validateAppointment = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { date, start_time, end_time, user_id, service_id } = body

    if (!date || !start_time || !end_time || !user_id || !service_id) {
      return c.json({
        error: 'Missing required fields',
        required: ['date', 'start_time', 'end_time', 'user_id', 'service_id']
      }, 400)
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
    }

    // Validar formato de hora
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return c.json({ error: 'Invalid time format. Use HH:MM' }, 400)
    }

    return
  } catch (error) {
    return c.json({ error: 'Invalid JSON format' }, 400)
  }
}

export const validateAvailability = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { date, start_time, end_time } = body

    if (!date || !start_time || !end_time) {
      return c.json({
        error: 'Missing required fields',
        required: ['date', 'start_time', 'end_time']
      }, 400)
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
    }

    // Validar formato de hora
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return c.json({ error: 'Invalid time format. Use HH:MM' }, 400)
    }

    return
  } catch (error) {
    return c.json({ error: 'Invalid JSON format' }, 400)
  }
}

export const validateUser = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { email, name } = body

    if (!email || !name) {
      return c.json({
        error: 'Missing required fields',
        required: ['email', 'name']
      }, 400)
    }

    if (!isValidEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }

    return
  } catch (error) {
    return c.json({ error: 'Invalid JSON format' }, 400)
  }
}