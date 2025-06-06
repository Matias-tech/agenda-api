import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { validationMiddleware } from './middleware/validation'
import routes from './routes'

const app = new Hono()

app.use(authMiddleware)
app.use(validationMiddleware)

app.route(routes)

app.get('/', (c) => {
  return c.text('Welcome to the Appointment API!')
})

export default app