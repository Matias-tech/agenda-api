import { Hono } from 'hono'
import { AvailabilityController } from '../controllers/availabilityController'

const availabilityController = new AvailabilityController()
const app = new Hono()

app.get('/availability', (c) => {
  return availabilityController.checkAvailability(c)
})

app.post('/availability', (c) => {
  return availabilityController.updateAvailability(c)
})

export default app