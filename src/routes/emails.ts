import { Hono } from 'hono'
import { Context } from 'hono'
import { Env } from '../types'
import { EmailController } from '../controllers/emailController'
import { EmailTemplateService } from '../services/emailTemplateService'
import { ReminderService } from '../services/reminderService'

const emailRoutes = new Hono<{ Bindings: Env }>()

// Instanciar los servicios
const createEmailController = (c: Context<{ Bindings: Env }>) => {
    return new EmailController(c.env.DB)
}

const createTemplateService = (c: Context<{ Bindings: Env }>) => {
    return new EmailTemplateService(c.env.DB)
}

const createReminderService = (c: Context<{ Bindings: Env }>) => {
    return new ReminderService(c.env.DB)
}

// GET /emails/test - Probar envío de correo
emailRoutes.post('/test', async (c) => {
    const emailController = createEmailController(c)
    return emailController.testEmail(c)
})

// POST /emails/send - Enviar correo de cita específico
emailRoutes.post('/send', async (c) => {
    try {
        const emailController = createEmailController(c)
        const { appointment_id, email_type, api_service } = await c.req.json()

        if (!appointment_id || !email_type || !api_service) {
            return c.json({
                error: 'Faltan parámetros requeridos: appointment_id, email_type, api_service'
            }, 400)
        }

        const result = await emailController.sendAppointmentEmail(
            appointment_id,
            email_type,
            api_service
        )

        return c.json(result, result.success ? 200 : 400)
    } catch (error) {
        return c.json({
            error: 'Error procesando solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/projects - Listar proyectos API configurados
emailRoutes.get('/projects', async (c) => {
    try {
        const query = `
      SELECT id, name, brand_name, logo_url, primary_color, 
             contact_email, contact_phone, website_url, address,
             from_email, is_active, created_at
      FROM api_projects 
      WHERE is_active = 1 
      ORDER BY brand_name
    `

        const result = await c.env.DB.prepare(query).all()

        return c.json({
            success: true,
            projects: result.results
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo proyectos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/projects/:projectId - Obtener proyecto específico
emailRoutes.get('/projects/:projectId', async (c) => {
    try {
        const projectId = c.req.param('projectId')

        const query = `
      SELECT id, name, brand_name, logo_url, primary_color, 
             contact_email, contact_phone, website_url, address,
             from_email, is_active, created_at, updated_at
      FROM api_projects 
      WHERE id = ?
    `

        const result = await c.env.DB.prepare(query).bind(projectId).first()

        if (!result) {
            return c.json({ error: 'Proyecto no encontrado' }, 404)
        }

        return c.json({
            success: true,
            project: result
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo proyecto',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// DELETE /emails/projects/:projectId - Eliminar proyecto
emailRoutes.delete('/projects/:projectId', async (c) => {
    try {
        const projectId = c.req.param('projectId')

        // Verificar que existe
        const existingProject = await c.env.DB.prepare(`
      SELECT id FROM api_projects WHERE id = ?
    `).bind(projectId).first()

        if (!existingProject) {
            return c.json({ error: 'Proyecto no encontrado' }, 404)
        }

        // Marcar como inactivo en lugar de eliminar
        await c.env.DB.prepare(`
      UPDATE api_projects 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ?
    `).bind(projectId).run()

        // También desactivar sus templates
        await c.env.DB.prepare(`
      UPDATE email_templates 
      SET is_active = 0, updated_at = datetime('now')
      WHERE api_project_id = ?
    `).bind(projectId).run()

        return c.json({
            success: true,
            message: 'Proyecto desactivado exitosamente'
        })
    } catch (error) {
        return c.json({
            error: 'Error eliminando proyecto',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/templates/:projectId - Listar templates de un proyecto
emailRoutes.get('/templates/:projectId', async (c) => {
    try {
        const projectId = c.req.param('projectId')

        const query = `
      SELECT id, email_type, subject_template, is_active, created_at, updated_at
      FROM email_templates 
      WHERE api_project_id = ? AND is_active = 1
      ORDER BY email_type
    `

        const result = await c.env.DB.prepare(query).bind(projectId).all()

        return c.json({
            success: true,
            templates: result.results
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo templates',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/logs/:appointmentId - Ver logs de correos de una cita
emailRoutes.get('/logs/:appointmentId', async (c) => {
    try {
        const appointmentId = c.req.param('appointmentId')

        const query = `
      SELECT 
        el.*,
        ap.brand_name,
        ap.name as project_name
      FROM email_logs el
      JOIN api_projects ap ON el.project_id = ap.id
      WHERE el.appointment_id = ?
      ORDER BY el.sent_at DESC
    `

        const result = await c.env.DB.prepare(query).bind(appointmentId).all()

        return c.json({
            success: true,
            logs: result.results
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo logs',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// POST /emails/projects - Crear/actualizar proyecto API
emailRoutes.post('/projects', async (c) => {
    try {
        const projectData = await c.req.json()
        const {
            id, name, brand_name, logo_url, primary_color,
            contact_email, contact_phone, website_url, address,
            resend_api_key, from_email
        } = projectData

        if (!id || !name || !brand_name || !resend_api_key || !from_email) {
            return c.json({
                error: 'Faltan campos requeridos: id, name, brand_name, resend_api_key, from_email'
            }, 400)
        }

        const query = `
      INSERT OR REPLACE INTO api_projects (
        id, name, brand_name, logo_url, primary_color,
        contact_email, contact_phone, website_url, address,
        resend_api_key, from_email, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `

        await c.env.DB.prepare(query).bind(
            id, name, brand_name, logo_url || '', primary_color || '#007bff',
            contact_email || '', contact_phone || '', website_url || '', address || '',
            resend_api_key, from_email
        ).run()

        return c.json({
            success: true,
            message: 'Proyecto configurado exitosamente'
        })
    } catch (error) {
        return c.json({
            error: 'Error configurando proyecto',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// POST /emails/templates - Crear/actualizar template de correo
emailRoutes.post('/templates', async (c) => {
    try {
        const templateData = await c.req.json()
        const {
            id, api_project_id, email_type, subject_template,
            html_template, text_template
        } = templateData

        if (!api_project_id || !email_type || !subject_template || !html_template) {
            return c.json({
                error: 'Faltan campos requeridos: api_project_id, email_type, subject_template, html_template'
            }, 400)
        }

        const templateId = id || `${api_project_id}_${email_type}`

        const query = `
      INSERT OR REPLACE INTO email_templates (
        id, api_project_id, email_type, subject_template,
        html_template, text_template, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `

        await c.env.DB.prepare(query).bind(
            templateId, api_project_id, email_type, subject_template,
            html_template, text_template || ''
        ).run()

        return c.json({
            success: true,
            message: 'Template configurado exitosamente',
            template_id: templateId
        })
    } catch (error) {
        return c.json({
            error: 'Error configurando template',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// POST /emails/templates/init/:projectId - Crear templates predeterminados
emailRoutes.post('/templates/init/:projectId', async (c) => {
    try {
        const projectId = c.req.param('projectId')
        const templateService = createTemplateService(c)

        const result = await templateService.createDefaultTemplates(projectId)

        return c.json({
            success: result.success,
            message: `Templates inicializados para proyecto ${projectId}`,
            created: result.created
        })
    } catch (error) {
        return c.json({
            error: 'Error inicializando templates',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/templates/preview/:projectId/:emailType - Preview de template
emailRoutes.get('/templates/preview/:projectId/:emailType', async (c) => {
    try {
        const projectId = c.req.param('projectId')
        const emailType = c.req.param('emailType')
        const templateService = createTemplateService(c)

        const result = await templateService.getTemplatePreview(projectId, emailType)

        if (!result.success) {
            return c.json({ error: 'Template no encontrado' }, 404)
        }

        return c.json(result.preview)
    } catch (error) {
        return c.json({
            error: 'Error generando preview',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// PUT /emails/templates/:projectId/:emailType - Actualizar template
emailRoutes.put('/templates/:projectId/:emailType', async (c) => {
    try {
        const projectId = c.req.param('projectId')
        const emailType = c.req.param('emailType')
        const updates = await c.req.json()
        const templateService = createTemplateService(c)

        const success = await templateService.updateTemplate(projectId, emailType, updates)

        if (!success) {
            return c.json({ error: 'No se pudo actualizar el template' }, 400)
        }

        return c.json({
            success: true,
            message: 'Template actualizado exitosamente'
        })
    } catch (error) {
        return c.json({
            error: 'Error actualizando template',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// POST /emails/reminders/send - Enviar recordatorios manualmente
emailRoutes.post('/reminders/send', async (c) => {
    try {
        const reminderService = createReminderService(c)
        const result = await reminderService.sendTomorrowReminders()

        return c.json({
            success: true,
            message: `Recordatorios procesados: ${result.sent} enviados, ${result.errors} errores`,
            ...result
        })
    } catch (error) {
        return c.json({
            error: 'Error enviando recordatorios',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/stats - Obtener estadísticas de correos
emailRoutes.get('/stats', async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7')
        const reminderService = createReminderService(c)
        const stats = await reminderService.getEmailStats(days)

        return c.json({
            success: true,
            period_days: days,
            ...stats
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo estadísticas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// POST /emails/cleanup - Limpiar logs antiguos
emailRoutes.post('/cleanup', async (c) => {
    try {
        const reminderService = createReminderService(c)
        const cleaned = await reminderService.cleanupOldEmailLogs()

        return c.json({
            success: true,
            message: `${cleaned} logs limpiados`,
            cleaned
        })
    } catch (error) {
        return c.json({
            error: 'Error limpiando logs',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/projects/:projectId - Obtener proyecto específico
emailRoutes.get('/projects/:projectId', async (c) => {
    try {
        const projectId = c.req.param('projectId')

        const query = `
      SELECT id, name, brand_name, logo_url, primary_color, 
             contact_email, contact_phone, website_url, address,
             from_email, is_active, created_at, updated_at
      FROM api_projects 
      WHERE id = ?
    `

        const result = await c.env.DB.prepare(query).bind(projectId).first()

        if (!result) {
            return c.json({ error: 'Proyecto no encontrado' }, 404)
        }

        return c.json({
            success: true,
            project: result
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo proyecto',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// DELETE /emails/projects/:projectId - Eliminar proyecto
emailRoutes.delete('/projects/:projectId', async (c) => {
    try {
        const projectId = c.req.param('projectId')

        // Verificar que existe
        const existingProject = await c.env.DB.prepare(`
      SELECT id FROM api_projects WHERE id = ?
    `).bind(projectId).first()

        if (!existingProject) {
            return c.json({ error: 'Proyecto no encontrado' }, 404)
        }

        // Marcar como inactivo en lugar de eliminar
        await c.env.DB.prepare(`
      UPDATE api_projects 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ?
    `).bind(projectId).run()

        // También desactivar sus templates
        await c.env.DB.prepare(`
      UPDATE email_templates 
      SET is_active = 0, updated_at = datetime('now')
      WHERE api_project_id = ?
    `).bind(projectId).run()

        return c.json({
            success: true,
            message: 'Proyecto desactivado exitosamente'
        })
    } catch (error) {
        return c.json({
            error: 'Error eliminando proyecto',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

// GET /emails/logs - Ver todos los logs de correos con filtros
emailRoutes.get('/logs', async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '50')
        const offset = parseInt(c.req.query('offset') || '0')
        const projectId = c.req.query('project_id')
        const emailType = c.req.query('email_type')
        const status = c.req.query('status')

        let whereConditions = []
        let params = []

        if (projectId) {
            whereConditions.push('el.project_id = ?')
            params.push(projectId)
        }

        if (emailType) {
            whereConditions.push('el.email_type = ?')
            params.push(emailType)
        }

        if (status) {
            whereConditions.push('el.status = ?')
            params.push(status)
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : ''

        const query = `
      SELECT 
        el.*,
        ap.brand_name,
        ap.name as project_name
      FROM email_logs el
      JOIN api_projects ap ON el.project_id = ap.id
      ${whereClause}
      ORDER BY el.sent_at DESC
      LIMIT ? OFFSET ?
    `

        params.push(limit, offset)
        const result = await c.env.DB.prepare(query).bind(...params).all()

        // También obtener el total de registros
        const countQuery = `
      SELECT COUNT(*) as total
      FROM email_logs el
      JOIN api_projects ap ON el.project_id = ap.id
      ${whereClause}
    `
        const countParams = params.slice(0, -2) // Remover limit y offset
        const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first()

        return c.json({
            success: true,
            logs: result.results,
            total: countResult?.total || 0,
            limit,
            offset
        })
    } catch (error) {
        return c.json({
            error: 'Error obteniendo logs',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, 500)
    }
})

export default emailRoutes
