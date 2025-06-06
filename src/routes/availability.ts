import { Hono } from 'hono'
import { AvailabilityController } from '../controllers/availabilityController'
import { Env } from '../types'

const availability = new Hono<{ Bindings: Env }>()

availability.get('/', async (c) => {
  const controller = new AvailabilityController(c.env)
  return controller.getAvailability(c)
})

availability.post('/', async (c) => {
  const controller = new AvailabilityController(c.env)
  return controller.createAvailability(c)
})

availability.put('/:id', async (c) => {
  const controller = new AvailabilityController(c.env)
  return controller.updateAvailability(c)
})

// New route for admin to get all availability records with filters
availability.get('/admin/all', async (c) => {
  const controller = new AvailabilityController(c.env);
  return controller.getAdminAvailability(c);
});

// New route to delete an availability slot
availability.delete('/:id', async (c) => {
  const controller = new AvailabilityController(c.env);
  return controller.deleteAvailability(c);
});

export default availability