import { Hono } from 'hono'
import AppointmentController from '../controllers/appointmentController'

const appointments = new Hono()
const appointmentController = new AppointmentController()

appointments.post('/create', (c) => {
  return appointmentController.createAppointment(c)
})

appointments.post('/confirm/:id', (c) => {
  return appointmentController.confirmAppointment(c)
})

appointments.delete('/cancel/:id', (c) => {
  return appointmentController.cancelAppointment(c)
})

export default appointments