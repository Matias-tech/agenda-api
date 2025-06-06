import { Env } from '../types'
import { emailTemplates, processEmailTemplate } from '../utils/emailTemplates'

// Servicio para inicializar templates de correo
export class EmailTemplateService {
    private db: D1Database

    constructor(db: D1Database) {
        this.db = db
    }

    // Crear templates predeterminados para un proyecto
    async createDefaultTemplates(projectId: string): Promise<{ success: boolean; created: number }> {
        let created = 0

        try {
            // Obtener configuración del proyecto
            const project = await this.db.prepare(`
        SELECT * FROM api_projects WHERE id = ?
      `).bind(projectId).first()

            if (!project) {
                return { success: false, created: 0 }
            }

            const brandColor = (project as any).primary_color || '#007bff'

            // Lista de templates a crear
            const templateTypes = [
                { type: 'appointment_confirmation', data: emailTemplates.confirmation },
                { type: 'appointment_reminder', data: emailTemplates.reminder },
                { type: 'appointment_cancellation', data: emailTemplates.cancellation },
                { type: 'appointment_pending', data: emailTemplates.pending },
                { type: 'appointment_rescheduled', data: emailTemplates.rescheduled }
            ]

            for (const templateType of templateTypes) {
                try {
                    // Verificar si ya existe
                    const existing = await this.db.prepare(`
            SELECT id FROM email_templates 
            WHERE api_project_id = ? AND email_type = ?
          `).bind(projectId, templateType.type).first()

                    if (!existing) {
                        // Procesar el HTML template con los estilos base
                        const processedHtml = processEmailTemplate(templateType.data.html, brandColor)

                        // Crear el template
                        const templateId = `${projectId}_${templateType.type}`

                        await this.db.prepare(`
              INSERT INTO email_templates (
                id, api_project_id, email_type, subject_template,
                html_template, text_template, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `).bind(
                            templateId,
                            projectId,
                            templateType.type,
                            templateType.data.subject,
                            processedHtml,
                            templateType.data.text
                        ).run()

                        created++
                        console.log(`✅ Template creado: ${templateType.type} para proyecto ${projectId}`)
                    } else {
                        console.log(`ℹ️ Template ya existe: ${templateType.type} para proyecto ${projectId}`)
                    }
                } catch (error) {
                    console.error(`❌ Error creando template ${templateType.type}:`, error)
                }
            }

            return { success: true, created }
        } catch (error) {
            console.error('Error en createDefaultTemplates:', error)
            return { success: false, created }
        }
    }

    // Actualizar template existente
    async updateTemplate(
        projectId: string,
        emailType: string,
        updates: {
            subject_template?: string
            html_template?: string
            text_template?: string
        }
    ): Promise<boolean> {
        try {
            const setParts = []
            const values = []

            if (updates.subject_template) {
                setParts.push('subject_template = ?')
                values.push(updates.subject_template)
            }

            if (updates.html_template) {
                setParts.push('html_template = ?')
                values.push(updates.html_template)
            }

            if (updates.text_template) {
                setParts.push('text_template = ?')
                values.push(updates.text_template)
            }

            if (setParts.length === 0) {
                return false
            }

            setParts.push('updated_at = datetime(\'now\')')
            values.push(projectId, emailType)

            const query = `
        UPDATE email_templates 
        SET ${setParts.join(', ')}
        WHERE api_project_id = ? AND email_type = ?
      `

            const result = await this.db.prepare(query).bind(...values).run()
            return (result.changes || 0) > 0
        } catch (error) {
            console.error('Error actualizando template:', error)
            return false
        }
    }

    // Obtener template con variables de ejemplo
    async getTemplatePreview(
        projectId: string,
        emailType: string
    ): Promise<{ success: boolean; preview?: any }> {
        try {
            const template = await this.db.prepare(`
        SELECT * FROM email_templates 
        WHERE api_project_id = ? AND email_type = ?
      `).bind(projectId, emailType).first()

            if (!template) {
                return { success: false }
            }

            const project = await this.db.prepare(`
        SELECT * FROM api_projects WHERE id = ?
      `).bind(projectId).first()

            if (!project) {
                return { success: false }
            }

            // Variables de ejemplo para preview
            const exampleVariables = {
                user_name: 'Juan Pérez',
                user_email: 'juan.perez@email.com',
                user_phone: '+56 9 1234 5678',
                appointment_id: 'APT-123456',
                appointment_date: 'viernes, 6 de junio de 2025',
                appointment_start_time: '10:00 AM',
                appointment_end_time: '11:00 AM',
                appointment_status: 'confirmada',
                appointment_notes: 'Primera consulta',
                service_name: 'Consulta General',
                service_description: 'Consulta médica general de rutina',
                service_duration: '60',
                service_price: '$25.000',
                brand_name: (project as any).brand_name,
                brand_logo: (project as any).logo_url,
                brand_color: (project as any).primary_color,
                contact_email: (project as any).contact_email,
                contact_phone: (project as any).contact_phone,
                website_url: (project as any).website_url,
                business_address: (project as any).address,
                current_date: 'jueves, 5 de junio de 2025',
                current_year: '2025'
            }

            // Procesar templates con variables de ejemplo
            let subjectPreview = (template as any).subject_template
            let htmlPreview = (template as any).html_template
            let textPreview = (template as any).text_template

            Object.keys(exampleVariables).forEach(key => {
                const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
                const value = (exampleVariables as any)[key] || ''

                subjectPreview = subjectPreview.replace(placeholder, value)
                htmlPreview = htmlPreview.replace(placeholder, value)
                if (textPreview) {
                    textPreview = textPreview.replace(placeholder, value)
                }
            })

            return {
                success: true,
                preview: {
                    subject: subjectPreview,
                    html: htmlPreview,
                    text: textPreview,
                    template_info: {
                        id: (template as any).id,
                        email_type: (template as any).email_type,
                        updated_at: (template as any).updated_at
                    }
                }
            }
        } catch (error) {
            console.error('Error generando preview:', error)
            return { success: false }
        }
    }
}
