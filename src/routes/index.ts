import { Hono } from 'hono'
import appointments from './appointments'
import availability from './availability'
import test from './test'
import { Env } from '../types'

const router = new Hono<{ Bindings: Env }>()

router.route('/appointments', appointments)
router.route('/availability', availability)

export default router