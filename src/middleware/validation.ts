import { Hono, Context } from 'hono'

export const validateAppointment = (c: Context) => {
  const { date, time, userId } = c.req.body

  if (!date || !time || !userId) {
    return c.text('Missing required fields: date, time, userId', 400)
  }

  // Additional validation logic can be added here

  return c.next()
}

export const validateAvailability = (c: Context) => {
  const { date } = c.req.body

  if (!date) {
    return c.text('Missing required field: date', 400)
  }

  // Additional validation logic can be added here

  return c.next()
}