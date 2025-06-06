import { Context } from 'hono'
import { Env, EmailType, EmailData, ApiProject, EmailTemplate, Appointment, Service, User } from '../types'
import { formatDate, formatTime } from '../utils/helpers'

export class EmailController {
    private db: D1Database

    constructor(db: D1Database) {
        this.db = db
    }

    // Obtener configuración del proyecto API
    async getProjectConfig(apiService: string): Promise<ApiProject | null> {
        const query = `
      SELECT * FROM api_projects 
      WHERE id = ? AND is_active = 1
    `
        const result = await this.db.prepare(query).bind(apiService).first()
        return result as ApiProject | null
    }

    // Obtener template de correo
    async getEmailTemplate(projectId: string, emailType: EmailType): Promise<EmailTemplate | null> {
        const query = `
      SELECT * FROM email_templates 
      WHERE api_project_id = ? AND email_type = ? AND is_active = 1
    `
        const result = await this.db.prepare(query).bind(projectId, emailType).first()
        return result as EmailTemplate | null
    }

    // Reemplazar variables en el template
    private replaceTemplateVariables(
        template: string,
        variables: Record<string, any>
    ): string {
        let processedTemplate = template

        Object.keys(variables).forEach(key => {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
            processedTemplate = processedTemplate.replace(placeholder, variables[key] || '')
        })

        return processedTemplate
    }

    // Preparar variables para los templates
    private prepareTemplateVariables(
        appointment: Appointment,
        user: User,
        service: Service,
        project: ApiProject
    ): Record<string, any> {
        return {
            // Variables del usuario
            user_name: user.name,
            user_email: user.email,
            user_phone: user.phone || 'No especificado',

            // Variables de la cita
            appointment_id: appointment.id,
            appointment_date: formatDate(appointment.date),
            appointment_start_time: formatTime(appointment.start_time),
            appointment_end_time: formatTime(appointment.end_time),
            appointment_status: appointment.status,
            appointment_notes: appointment.notes || 'Sin notas adicionales',

            // Variables del servicio
            service_name: service.name,
            service_description: service.description || '',
            service_duration: service.duration,
            service_price: service.price ? `$${service.price}` : 'Consultar',

            // Variables del proyecto/marca
            brand_name: project.brand_name,
            brand_logo: project.logo_url,
            brand_color: project.primary_color,
            contact_email: project.contact_email,
            contact_phone: project.contact_phone || '',
            website_url: project.website_url || '',
            business_address: project.address || '',

            // Variables de fecha y hora actuales
            current_date: formatDate(new Date().toISOString().split('T')[0]),
            current_year: new Date().getFullYear(),
        }
    }

    // Enviar correo usando Resend
    private async sendEmail(emailData: EmailData): Promise<boolean> {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${emailData.project_config.resend_api_key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: emailData.project_config.from_email,
                    to: [emailData.to],
                    subject: emailData.subject,
                    html: emailData.html,
                    text: emailData.text,
                }),
            })

            if (!response.ok) {
                console.error('Error enviando correo:', await response.text())
                return false
            }

            return true
        } catch (error) {
            console.error('Error en envío de correo:', error)
            return false
        }
    }

    // Método principal para enviar correos de citas
    async sendAppointmentEmail(
        appointmentId: string,
        emailType: EmailType,
        apiService: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Obtener datos de la cita con joins
            const appointmentQuery = `
        SELECT 
          a.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          s.name as service_name,
          s.description as service_description,
          s.duration as service_duration,
          s.price as service_price
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
      `

            const appointmentData = await this.db.prepare(appointmentQuery).bind(appointmentId).first()

            if (!appointmentData) {
                return { success: false, message: 'Cita no encontrada' }
            }

            // Construir objetos separados
            const appointment: Appointment = {
                id: appointmentData.id as string,
                user_id: appointmentData.user_id as string,
                service_id: appointmentData.service_id as string,
                date: appointmentData.date as string,
                start_time: appointmentData.start_time as string,
                end_time: appointmentData.end_time as string,
                status: appointmentData.status as 'pending' | 'confirmed' | 'cancelled',
                notes: appointmentData.notes as string,
                created_at: appointmentData.created_at as string,
                updated_at: appointmentData.updated_at as string,
            }

            const user: User = {
                id: appointmentData.user_id as string,
                email: appointmentData.user_email as string,
                name: appointmentData.user_name as string,
                phone: appointmentData.user_phone as string,
                created_at: '',
                updated_at: '',
            }

            const service: Service = {
                id: appointmentData.service_id as string,
                name: appointmentData.service_name as string,
                description: appointmentData.service_description as string,
                duration: appointmentData.service_duration as number,
                price: appointmentData.service_price as number,
                api_service: apiService,
                created_at: '',
            }

            // Obtener configuración del proyecto
            const project = await this.getProjectConfig(apiService)
            if (!project) {
                return { success: false, message: 'Configuración de proyecto no encontrada' }
            }

            // Obtener template
            const template = await this.getEmailTemplate(project.id, emailType)
            if (!template) {
                return { success: false, message: 'Template de correo no encontrado' }
            }

            // Preparar variables
            const variables = this.prepareTemplateVariables(appointment, user, service, project)

            // Procesar templates
            const subject = this.replaceTemplateVariables(template.subject_template, variables)
            const html = this.replaceTemplateVariables(template.html_template, variables)
            const text = template.text_template
                ? this.replaceTemplateVariables(template.text_template, variables)
                : undefined

            // Enviar correo
            const emailData: EmailData = {
                to: user.email,
                subject,
                html,
                text,
                project_config: project,
            }

            const sent = await this.sendEmail(emailData)

            if (sent) {
                // Registrar el envío en la base de datos
                await this.logEmailSent(appointmentId, user.email, emailType, project.id)
                return { success: true, message: 'Correo enviado exitosamente' }
            } else {
                return { success: false, message: 'Error al enviar el correo' }
            }

        } catch (error) {
            console.error('Error en sendAppointmentEmail:', error)
            return { success: false, message: 'Error interno del servidor' }
        }
    }

    // Registrar envío de correo
    private async logEmailSent(
        appointmentId: string,
        email: string,
        emailType: EmailType,
        projectId: string
    ): Promise<void> {
        const query = `
      INSERT INTO email_logs (
        appointment_id, email, email_type, project_id, sent_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `

        await this.db.prepare(query)
            .bind(appointmentId, email, emailType, projectId)
            .run()
    }

    // Método para probar envío de correo
    async testEmail(c: Context<{ Bindings: Env }>): Promise<Response> {
        try {
            const { appointment_id, email_type, api_service } = await c.req.json()

            if (!appointment_id || !email_type || !api_service) {
                return c.json({
                    error: 'Faltan parámetros: appointment_id, email_type, api_service'
                }, 400)
            }

            const result = await this.sendAppointmentEmail(appointment_id, email_type, api_service)

            return c.json(result, result.success ? 200 : 400)
        } catch (error) {
            return c.json({
                error: 'Error procesando solicitud',
                details: error instanceof Error ? error.message : 'Error desconocido'
            }, 500)
        }
    }
}

// Función helper para usar en otros controladores
export async function sendAppointmentNotification(
    db: D1Database,
    appointmentId: string,
    emailType: EmailType,
    apiService: string
): Promise<boolean> {
    const emailController = new EmailController(db)
    const result = await emailController.sendAppointmentEmail(appointmentId, emailType, apiService)
    return result.success
}
