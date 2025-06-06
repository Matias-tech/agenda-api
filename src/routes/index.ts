import { Hono } from 'hono'
import appointments from './appointments'
import availability from './availability'

const router = new Hono()

router.route('/appointments', appointments)
router.route('/availability', availability)

export default router