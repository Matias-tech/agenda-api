import { Env } from '../types'
import { sendAppointmentNotification } from '../controllers/emailController'

// Servicio para enviar recordatorios automáticos
export class ReminderService {
    private db: D1Database

    constructor(db: D1Database) {
        this.db = db
    }

    // Enviar recordatorios para citas del día siguiente
    async sendTomorrowReminders(): Promise<{ sent: number; errors: number }> {
        let sent = 0
        let errors = 0

        try {
            // Calcular fecha de mañana
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowDate = tomorrow.toISOString().split('T')[0]

            // Buscar citas confirmadas para mañana
            const query = `
        SELECT 
          a.id,
          a.date,
          a.start_time,
          s.api_service
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.date = ? 
        AND a.status = 'confirmed'
        AND s.api_service IS NOT NULL
      `

            const appointments = await this.db.prepare(query).bind(tomorrowDate).all()

            console.log(`Enviando recordatorios para ${appointments.results.length} citas del ${tomorrowDate}`)

            // Enviar recordatorio para cada cita
            for (const appointment of appointments.results as any[]) {
                try {
                    // Verificar si ya se envió recordatorio
                    const reminderSent = await this.db.prepare(`
            SELECT id FROM email_logs 
            WHERE appointment_id = ? AND email_type = 'appointment_reminder'
          `).bind(appointment.id).first()

                    if (!reminderSent) {
                        const success = await sendAppointmentNotification(
                            this.db,
                            appointment.id,
                            'appointment_reminder',
                            appointment.api_service
                        )

                        if (success) {
                            sent++
                            console.log(`✅ Recordatorio enviado para cita ${appointment.id}`)
                        } else {
                            errors++
                            console.error(`❌ Error enviando recordatorio para cita ${appointment.id}`)
                        }
                    } else {
                        console.log(`ℹ️ Recordatorio ya enviado para cita ${appointment.id}`)
                    }
                } catch (error) {
                    errors++
                    console.error(`❌ Error procesando cita ${appointment.id}:`, error)
                }
            }

        } catch (error) {
            console.error('Error en sendTomorrowReminders:', error)
            errors++
        }

        return { sent, errors }
    }

    // Limpiar logs antiguos de correos (más de 30 días)
    async cleanupOldEmailLogs(): Promise<number> {
        try {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const result = await this.db.prepare(`
        DELETE FROM email_logs 
        WHERE sent_at < ?
      `).bind(thirtyDaysAgo.toISOString()).run()

            console.log(`🧹 Limpiados ${result.meta.changes} logs de correo antiguos`)
            return result.meta.changes || 0
        } catch (error) {
            console.error('Error limpiando logs antiguos:', error)
            return 0
        }
    }

    // Obtener estadísticas de correos enviados
    async getEmailStats(days: number = 7): Promise<any> {
        try {
            const daysAgo = new Date()
            daysAgo.setDate(daysAgo.getDate() - days)

            const stats = await this.db.prepare(`
        SELECT 
          email_type,
          project_id,
          COUNT(*) as count,
          DATE(sent_at) as date
        FROM email_logs el
        JOIN api_projects ap ON el.project_id = ap.id
        WHERE sent_at >= ?
        GROUP BY email_type, project_id, DATE(sent_at)
        ORDER BY sent_at DESC
      `).bind(daysAgo.toISOString()).all()

            const summary = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_emails,
          COUNT(DISTINCT appointment_id) as unique_appointments,
          COUNT(DISTINCT project_id) as active_projects
        FROM email_logs
        WHERE sent_at >= ?
      `).bind(daysAgo.toISOString()).first()

            return {
                summary,
                details: stats.results
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error)
            return { summary: null, details: [] }
        }
    }
}

// Función para usar en Workers con cron jobs
export async function handleScheduledReminders(env: Env): Promise<Response> {
    const reminderService = new ReminderService(env.DB)

    try {
        const result = await reminderService.sendTomorrowReminders()

        return new Response(JSON.stringify({
            success: true,
            message: `Recordatorios procesados: ${result.sent} enviados, ${result.errors} errores`,
            ...result
        }), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Error procesando recordatorios',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
