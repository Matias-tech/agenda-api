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
                        // console.log(`✅ Template creado: ${templateType.type} para proyecto ${projectId}`) // Removed
                    } else {
                        // console.log(`ℹ️ Template ya existe: ${templateType.type} para proyecto ${projectId}`) // Removed
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
            } setParts.push('updated_at = datetime(\'now\')')
            values.push(projectId, emailType)

            const query = `
        UPDATE email_templates 
        SET ${setParts.join(', ')}
        WHERE api_project_id = ? AND email_type = ?
      `

            const result = await this.db.prepare(query).bind(...values).run()
            return (result.meta.changes || 0) > 0
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
                // User variables
                user_name: "Elena Rodriguez",
                user_email: "elena.rodriguez@example.com",
                user_phone: "+34 91 234 5678", // Example with phone
                // user_phone: "", // Example without phone - templates should handle this

                // Appointment variables
                appointment_id: "APT-DEMO-67890",
                appointment_date: "martes, 15 de octubre de 2024", // Consider a date formatting helper
                appointment_start_time: "14:30",
                appointment_end_time: "15:30",
                appointment_status: emailType === 'appointment_pending' ? 'pendiente' : 'confirmada', // Basic adaptation
                appointment_notes: "Revisión anual y consulta sobre nueva medicación.", // Example with notes
                // appointment_notes: "", // Example without notes - templates should handle this

                // Service variables
                service_name: "Consulta Médica Avanzada",
                service_description: "Una consulta detallada con el especialista, incluyendo revisión de historial y plan de tratamiento.",
                service_duration: 60, // Number
                service_price: "75.00", // String, currency symbol usually in template

                // Project/Brand variables (fetched or defaults)
                brand_name: (project as any)?.brand_name || "Clínica Bienestar Total",
                brand_logo: (project as any)?.logo_url || "https://example.com/logo_bienestar.png",
                brand_color: (project as any)?.primary_color || "#4A90E2",
                contact_email: (project as any)?.contact_email || "info@bienestartotal.example.com",
                contact_phone: (project as any)?.contact_phone || "+34 900 100 200",
                website_url: (project as any)?.website_url || "https://bienestartotal.example.com",
                business_address: (project as any)?.address || "Calle de la Salud, 123, Madrid, España",

                // Date/Time variables
                current_date: "lunes, 14 de octubre de 2024", // Consider a dynamic date
                current_year: new Date().getFullYear().toString(),

                // Common action URLs (examples, actual URLs might be dynamically generated)
                confirmation_link: `https://example.com/confirm/${"APT-DEMO-67890"}`,
                cancellation_link: `https://example.com/cancel/${"APT-DEMO-67890"}`,
                reschedule_link: `https://example.com/reschedule/${"APT-DEMO-67890"}`,
            };

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

  /**
   * Fetches all active email templates for a given project ID.
   * @param {string} projectId - The ID of the project whose templates are to be fetched.
   * @returns {Promise<any[]>} A promise that resolves to an array of template objects.
   *                           Returns an empty array if no templates are found or if the project ID is invalid.
   * @throws Will throw an error if the database query fails.
   */
  async getTemplatesByProjectId(projectId: string): Promise<any[]> {
    try {
      // This service uses D1Database.
      const stmt = this.db.prepare(
        'SELECT * FROM email_templates WHERE api_project_id = ? AND is_active = TRUE ORDER BY email_type, created_at'
      );
      const result = await stmt.bind(projectId).all();
      return result.results || []; // D1 typically returns results in a .results property
    } catch (error) {
      // TODO: Replace console.error with a proper logger if available and consistent with the project's logging strategy.
      console.error(`Error fetching templates for project ID ${projectId}:`, error);
      throw error;
    }
  }
}
