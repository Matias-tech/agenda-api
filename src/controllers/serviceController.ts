import { Context } from 'hono'
import { Env, Service } from '../types'
import { DatabaseService } from '../utils/database'

export class ServiceController {
    private dbService: DatabaseService

    constructor(env: Env) {
        this.dbService = new DatabaseService(env.DB)
    }

    // Obtener todos los servicios
    async getServices(c: Context) {
        try {
            const api_service = c.req.query('api_service')
            const category = c.req.query('category')
            const is_active = c.req.query('is_active')

            let query = `
        SELECT s.*, ap.brand_name, ap.primary_color, ap.logo_url 
        FROM services s
        LEFT JOIN api_projects ap ON s.api_service = ap.id
      `
            const params = []
            const conditions = []

            if (api_service) {
                conditions.push('s.api_service = ?')
                params.push(api_service)
            }

            if (category) {
                conditions.push('s.category = ?')
                params.push(category)
            }

            // Por defecto solo mostrar servicios con proyectos activos
            if (is_active !== 'false') {
                conditions.push('(ap.is_active = 1 OR ap.is_active IS NULL)')
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ')
            }

            query += ' ORDER BY s.name'

            const result = await c.env.DB.prepare(query).bind(...params).all()
            return c.json({
                success: true,
                services: result.results,
                filters: { api_service, category, is_active }
            })
        } catch (error) {
            console.error('Error fetching services:', error)
            return c.json({ error: 'Failed to fetch services' }, 500)
        }
    }

    // Obtener servicios agrupados por proyecto API
    async getServicesByProject(c: Context) {
        try {
            const query = `
        SELECT 
          ap.id as project_id,
          ap.name as project_name,
          ap.brand_name,
          ap.logo_url,
          ap.primary_color,
          s.id as service_id,
          s.name as service_name,
          s.description,
          s.duration,
          s.price,
          s.category
        FROM api_projects ap
        LEFT JOIN services s ON ap.id = s.api_service
        WHERE ap.is_active = 1
        ORDER BY ap.brand_name, s.name
      `

            const result = await c.env.DB.prepare(query).all()

            // Agrupar servicios por proyecto
            const groupedServices: Record<string, any> = {}

            for (const row of result.results as any[]) {
                const projectId = row.project_id

                if (!groupedServices[projectId]) {
                    groupedServices[projectId] = {
                        project_id: projectId,
                        project_name: row.project_name,
                        brand_name: row.brand_name,
                        logo_url: row.logo_url,
                        primary_color: row.primary_color,
                        services: []
                    }
                }

                // Solo agregar servicios si existen
                if (row.service_id) {
                    groupedServices[projectId].services.push({
                        id: row.service_id,
                        name: row.service_name,
                        description: row.description,
                        duration: row.duration,
                        price: row.price,
                        category: row.category
                    })
                }
            }

            return c.json({
                success: true,
                projects: Object.values(groupedServices)
            })
        } catch (error) {
            console.error('Error fetching services by project:', error)
            return c.json({ error: 'Failed to fetch services by project' }, 500)
        }
    }

    // Obtener un servicio específico
    async getServiceById(c: Context) {
        try {
            const serviceId = c.req.param('id')

            const query = `
        SELECT s.*, ap.brand_name, ap.primary_color, ap.logo_url, ap.contact_email, ap.contact_phone
        FROM services s
        LEFT JOIN api_projects ap ON s.api_service = ap.id
        WHERE s.id = ?
      `

            const service = await c.env.DB.prepare(query).bind(serviceId).first()

            if (!service) {
                return c.json({ error: 'Service not found' }, 404)
            }

            return c.json({
                success: true,
                service
            })
        } catch (error) {
            console.error('Error fetching service:', error)
            return c.json({ error: 'Failed to fetch service' }, 500)
        }
    }

    // Crear un nuevo servicio
    async createService(c: Context) {
        try {
            const body = await c.req.json()
            const { id, name, description, duration, price, api_service, category } = body

            // Validaciones básicas
            if (!id || !name || !duration || !api_service) {
                return c.json({
                    error: 'id, name, duration, and api_service are required'
                }, 400)
            }

            // Verificar que el proyecto API existe
            const project = await c.env.DB.prepare(`
        SELECT id FROM api_projects WHERE id = ? AND is_active = 1
      `).bind(api_service).first()

            if (!project) {
                return c.json({ error: 'API project not found or inactive' }, 404)
            }

            const now = new Date().toISOString()

            await c.env.DB.prepare(`
        INSERT INTO services (id, name, description, duration, price, api_service, category, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, name, description || null, duration, price || null, api_service, category || null, now).run()

            const newService: Service = {
                id,
                name,
                description: description || undefined,
                duration,
                price: price || undefined,
                api_service,
                category: category || undefined,
                created_at: now
            }

            return c.json({
                success: true,
                service: newService,
                message: 'Service created successfully'
            }, 201)
        } catch (error) {
            console.error('Error creating service:', error)
            return c.json({ error: 'Failed to create service' }, 500)
        }
    }

    // Actualizar un servicio
    async updateService(c: Context) {
        try {
            const serviceId = c.req.param('id')
            const body = await c.req.json()
            const { name, description, duration, price, api_service, category } = body

            // Verificar que el servicio existe
            const existingService = await c.env.DB.prepare(`
        SELECT id FROM services WHERE id = ?
      `).bind(serviceId).first()

            if (!existingService) {
                return c.json({ error: 'Service not found' }, 404)
            }

            // Si se cambia el api_service, verificar que el nuevo proyecto existe
            if (api_service) {
                const project = await c.env.DB.prepare(`
          SELECT id FROM api_projects WHERE id = ? AND is_active = 1
        `).bind(api_service).first()

                if (!project) {
                    return c.json({ error: 'API project not found or inactive' }, 404)
                }
            }

            const updateFields = []
            const updateParams = []

            if (name) {
                updateFields.push('name = ?')
                updateParams.push(name)
            }
            if (description !== undefined) {
                updateFields.push('description = ?')
                updateParams.push(description)
            }
            if (duration) {
                updateFields.push('duration = ?')
                updateParams.push(duration)
            }
            if (price !== undefined) {
                updateFields.push('price = ?')
                updateParams.push(price)
            }
            if (api_service) {
                updateFields.push('api_service = ?')
                updateParams.push(api_service)
            }
            if (category !== undefined) {
                updateFields.push('category = ?')
                updateParams.push(category)
            }

            if (updateFields.length === 0) {
                return c.json({ error: 'No fields to update' }, 400)
            }

            updateParams.push(serviceId)

            await c.env.DB.prepare(`
        UPDATE services SET ${updateFields.join(', ')} WHERE id = ?
      `).bind(...updateParams).run()

            return c.json({
                success: true,
                message: 'Service updated successfully'
            })
        } catch (error) {
            console.error('Error updating service:', error)
            return c.json({ error: 'Failed to update service' }, 500)
        }
    }

    // Eliminar un servicio
    async deleteService(c: Context) {
        try {
            const serviceId = c.req.param('id')

            // Verificar que el servicio existe
            const existingService = await c.env.DB.prepare(`
        SELECT id FROM services WHERE id = ?
      `).bind(serviceId).first()

            if (!existingService) {
                return c.json({ error: 'Service not found' }, 404)
            }

            // Verificar que no hay citas activas para este servicio
            const activeAppointments = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM appointments 
        WHERE service_id = ? AND status IN ('pending', 'confirmed')
      `).bind(serviceId).first()

            if ((activeAppointments as any)?.count > 0) {
                return c.json({
                    error: 'Cannot delete service with active appointments'
                }, 400)
            }

            await c.env.DB.prepare(`
        DELETE FROM services WHERE id = ?
      `).bind(serviceId).run()

            return c.json({
                success: true,
                message: 'Service deleted successfully'
            })
        } catch (error) {
            console.error('Error deleting service:', error)
            return c.json({ error: 'Failed to delete service' }, 500)
        }
    }
}

export default ServiceController
