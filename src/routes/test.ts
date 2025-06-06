import { Hono } from 'hono'
import { TestController } from '../controllers/testController'
import { Env } from '../types'

const test = new Hono<{ Bindings: Env }>()
const testController = new TestController()

test.get('/', async (c) => {
  return testController.showTestForms(c)
})

export default test
