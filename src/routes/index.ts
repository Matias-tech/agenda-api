import { Hono } from 'hono'
import appointments from './appointments'
import availability from './availability'
import emails from './emails'
import test from './test'
import { Env } from '../types'

const router = new Hono<{ Bindings: Env }>()

router.route('/appointments', appointments)
router.route('/availability', availability)
router.route('/emails', emails)

export default router