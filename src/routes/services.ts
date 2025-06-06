import { Hono } from 'hono'
import ServiceController from '../controllers/serviceController'
import { Env } from '../types'

const services = new Hono<{ Bindings: Env }>()

// GET /services - Obtener todos los servicios con filtros opcionales
services.get('/', async (c) => {
    const controller = new ServiceController(c.env)
    return controller.getServices(c)
})

// GET /services/by-project - Obtener servicios agrupados por proyecto
services.get('/by-project', async (c) => {
    const controller = new ServiceController(c.env)
    return controller.getServicesByProject(c)
})

// GET /services/:id - Obtener un servicio específico
services.get('/:id', async (c) => {
    const controller = new ServiceController(c.env)
    return controller.getServiceById(c)
})

// POST /services - Crear un nuevo servicio
services.post('/', async (c) => {
    const controller = new ServiceController(c.env)
    return controller.createService(c)
})

// PUT /services/:id - Actualizar un servicio
services.put('/:id', async (c) => {
    const controller = new ServiceController(c.env)
    return controller.updateService(c)
})

// DELETE /services/:id - Eliminar un servicio
services.delete('/:id', async (c) => {
    const controller = new ServiceController(c.env)
    return controller.deleteService(c)
})

export default services
