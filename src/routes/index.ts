import { Hono } from 'hono'
import appointments from './appointments'
import availability from './availability'
import emails from './emails'
import services from './services'
import test from './test'
import { Env } from '../types'

const router = new Hono<{ Bindings: Env }>()

router.route('/appointments', appointments)
router.route('/availability', availability)
router.route('/emails', emails)
router.route('/services', services)

export default router