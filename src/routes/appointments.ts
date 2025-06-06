import { Hono } from 'hono'
import AppointmentController from '../controllers/appointmentController'
import { Env } from '../types'

const appointments = new Hono<{ Bindings: Env }>()

appointments.post('/', async (c) => {
  const controller = new AppointmentController(c.env)
  return controller.createAppointment(c)
})

appointments.get('/', async (c) => {
  const controller = new AppointmentController(c.env)
  return controller.getAppointments(c)
})

appointments.post('/:id/confirm', async (c) => {
  const controller = new AppointmentController(c.env)
  return controller.confirmAppointment(c)
})

appointments.post('/:id/cancel', async (c) => {
  const controller = new AppointmentController(c.env)
  return controller.cancelAppointment(c)
})

appointments.post('/:id/reschedule', async (c) => {
  const controller = new AppointmentController(c.env)
  return controller.rescheduleAppointment(c)
})

export default appointments