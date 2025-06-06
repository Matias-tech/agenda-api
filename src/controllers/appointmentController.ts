import { Context } from 'hono';
import { Env, Appointment, User } from '../types';
import { DatabaseService } from '../utils/database';
import { generateUniqueId, isValidEmail } from '../utils/helpers';
import { sendAppointmentNotification } from './emailController';

export class AppointmentController {
  private dbService: DatabaseService;

  constructor(env: Env) {
    this.dbService = new DatabaseService(env.DB);
  }

  async createAppointment(c: Context) {
    try {
      const body = await c.req.json();
      const { user_email, user_name, user_phone, service_id, date, start_time, end_time, notes } = body;

      // Validación básica
      if (!user_email || !user_name || !service_id || !date || !start_time || !end_time) {
        return c.json({
          error: 'user_email, user_name, service_id, date, start_time, and end_time are required'
        }, 400);
      }

      if (!isValidEmail(user_email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Verificar si el usuario ya existe o crear uno nuevo
      let user = await c.env.DB.prepare(`
        SELECT * FROM users WHERE email = ?
      `).bind(user_email).first();

      if (!user) {
        // Crear nuevo usuario
        const userId = generateUniqueId();
        const now = new Date().toISOString();

        await c.env.DB.prepare(`
          INSERT INTO users (id, email, name, phone, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, user_email, user_name, user_phone || null, now, now).run();

        user = { id: userId, email: user_email, name: user_name, phone: user_phone };
      }

      // Verificar que el servicio existe y obtener información del proyecto
      const service = await c.env.DB.prepare(`
        SELECT s.*, ap.id as project_id, ap.name as project_name, ap.brand_name, ap.is_active as project_active
        FROM services s
        LEFT JOIN api_projects ap ON s.api_service = ap.id
        WHERE s.id = ?
      `).bind(service_id).first();

      if (!service) {
        return c.json({ error: 'Service not found' }, 404);
      }

      // Verificar que el proyecto API esté activo si existe
      if ((service as any).api_service && !(service as any).project_active) {
        return c.json({ error: 'Service belongs to an inactive project' }, 400);
      }

      // Verificar disponibilidad
      const conflictingAppointment = await c.env.DB.prepare(`
        SELECT * FROM appointments 
        WHERE date = ? AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        ) AND status != 'cancelled'
      `).bind(date, start_time, start_time, end_time, end_time, start_time, end_time).first();

      if (conflictingAppointment) {
        return c.json({ error: 'Time slot is already booked' }, 409);
      }

      // Crear la cita
      const appointmentId = generateUniqueId();
      const now = new Date().toISOString();

      await c.env.DB.prepare(`
        INSERT INTO appointments (id, user_id, service_id, date, start_time, end_time, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(appointmentId, user.id, service_id, date, start_time, end_time, 'pending', notes || null, now, now).run();

      const newAppointment = {
        id: appointmentId,
        user_id: user.id,
        service_id,
        date,
        start_time,
        end_time,
        status: 'pending',
        notes: notes || null,
        created_at: now,
        updated_at: now
      };

      // Enviar correo de cita pendiente de confirmación
      const apiService = (service as any).api_service;
      if (apiService) {
        try {
          await sendAppointmentNotification(
            c.env.DB,
            appointmentId,
            'appointment_pending',
            apiService
          );
        } catch (emailError) {
          console.error('Error enviando correo de cita pendiente:', emailError);
          // No fallar la creación de la cita por error de correo
        }
      }

      return c.json(newAppointment, 201);
    } catch (error) {
      console.error('Error creating appointment:', error);
      return c.json({ error: 'Failed to create appointment' }, 500);
    }
  }

  async getAppointments(c: Context) {
    try {
      const date = c.req.query('date');
      const userId = c.req.query('user_id');
      const api_service = c.req.query('api_service');
      const responsible_user_id = c.req.query('responsible_user_id');

      let query = `
        SELECT a.*, u.name as user_name, u.email as user_email, s.name as service_name, s.duration, s.api_service, s.category
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN services s ON a.service_id = s.id
      `;
      const params = [];
      const conditions = [];

      if (date) {
        conditions.push('a.date = ?');
        params.push(date);
      }

      if (userId) {
        conditions.push('a.user_id = ?');
        params.push(userId);
      }

      if (api_service) {
        conditions.push('s.api_service = ?');
        params.push(api_service);
      }

      // Note: responsible_user_id filtering would require joining with availability table
      // For now, we'll skip this filter since it's complex without a direct relationship

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY a.date, a.start_time';

      const result = await c.env.DB.prepare(query).bind(...params).all();
      return c.json({ appointments: result.results });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return c.json({ error: 'Failed to fetch appointments' }, 500);
    }
  }

  async confirmAppointment(c: Context) {
    const appointmentId = c.req.param('id');

    try {
      // Primero obtener los datos de la cita para enviar el correo
      const appointmentData = await c.env.DB.prepare(`
        SELECT a.*, s.api_service
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ? AND a.status = 'pending'
      `).bind(appointmentId).first();

      if (!appointmentData) {
        return c.json({ error: 'Appointment not found or already processed' }, 404);
      }

      const result = await c.env.DB.prepare(`
        UPDATE appointments 
        SET status = 'confirmed', updated_at = ? 
        WHERE id = ? AND status = 'pending'
      `).bind(new Date().toISOString(), appointmentId).run();

      if (result.changes === 0) {
        return c.json({ error: 'Appointment not found or already processed' }, 404);
      }

      // Enviar correo de confirmación
      const apiService = appointmentData.api_service;
      if (apiService) {
        try {
          await sendAppointmentNotification(
            c.env.DB,
            appointmentId,
            'appointment_confirmation',
            apiService as string
          );
        } catch (emailError) {
          console.error('Error enviando correo de confirmación:', emailError);
          // No fallar la confirmación por error de correo
        }
      }

      return c.json({ message: 'Appointment confirmed successfully' });
    } catch (error) {
      console.error('Error confirming appointment:', error);
      return c.json({ error: 'Failed to confirm appointment' }, 500);
    }
  }

  async cancelAppointment(c: Context) {
    const appointmentId = c.req.param('id');

    try {
      // Primero obtener los datos de la cita para enviar el correo
      const appointmentData = await c.env.DB.prepare(`
        SELECT a.*, s.api_service
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ? AND a.status != 'cancelled'
      `).bind(appointmentId).first();

      if (!appointmentData) {
        return c.json({ error: 'Appointment not found or already cancelled' }, 404);
      }

      const result = await c.env.DB.prepare(`
        UPDATE appointments 
        SET status = 'cancelled', updated_at = ? 
        WHERE id = ? AND status != 'cancelled'
      `).bind(new Date().toISOString(), appointmentId).run();

      if (result.changes === 0) {
        return c.json({ error: 'Appointment not found or already cancelled' }, 404);
      }

      // Enviar correo de cancelación
      const apiService = appointmentData.api_service;
      if (apiService) {
        try {
          await sendAppointmentNotification(
            c.env.DB,
            appointmentId,
            'appointment_cancellation',
            apiService as string
          );
        } catch (emailError) {
          console.error('Error enviando correo de cancelación:', emailError);
          // No fallar la cancelación por error de correo
        }
      }

      return c.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return c.json({ error: 'Failed to cancel appointment' }, 500);
    }
  }

  // Nueva función para reagendar citas
  async rescheduleAppointment(c: Context) {
    const appointmentId = c.req.param('id');
    const { date, start_time, end_time, notes } = await c.req.json();

    try {
      if (!date || !start_time || !end_time) {
        return c.json({
          error: 'date, start_time, and end_time are required'
        }, 400);
      }

      // Verificar que la cita existe
      const appointmentData = await c.env.DB.prepare(`
        SELECT a.*, s.api_service
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ? AND a.status != 'cancelled'
      `).bind(appointmentId).first();

      if (!appointmentData) {
        return c.json({ error: 'Appointment not found or cancelled' }, 404);
      }

      // Verificar disponibilidad en la nueva fecha/hora
      const conflictingAppointment = await c.env.DB.prepare(`
        SELECT * FROM appointments 
        WHERE date = ? AND id != ? AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        ) AND status != 'cancelled'
      `).bind(date, appointmentId, start_time, start_time, end_time, end_time, start_time, end_time).first();

      if (conflictingAppointment) {
        return c.json({ error: 'New time slot is already booked' }, 409);
      }

      // Actualizar la cita
      const result = await c.env.DB.prepare(`
        UPDATE appointments 
        SET date = ?, start_time = ?, end_time = ?, notes = ?, 
            status = 'confirmed', updated_at = ?
        WHERE id = ?
      `).bind(date, start_time, end_time, notes || appointmentData.notes, new Date().toISOString(), appointmentId).run();

      if (result.changes === 0) {
        return c.json({ error: 'Failed to reschedule appointment' }, 500);
      }

      // Enviar correo de reagendamiento
      const apiService = appointmentData.api_service;
      if (apiService) {
        try {
          await sendAppointmentNotification(
            c.env.DB,
            appointmentId,
            'appointment_rescheduled',
            apiService as string
          );
        } catch (emailError) {
          console.error('Error enviando correo de reagendamiento:', emailError);
        }
      }

      return c.json({ message: 'Appointment rescheduled successfully' });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return c.json({ error: 'Failed to reschedule appointment' }, 500);
    }
  }

  async getAdminAppointments(c: Context) {
    const {
        page = '1',
        limit = '20',
        date_start,
        date_end,
        api_service_id, // This is project_id from api_projects table
        service_id,
        status,
        user_query // Search in user's name or email
    } = c.req.query();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) return c.json({ error: 'Invalid page number' }, 400);
    if (isNaN(limitNum) || limitNum < 1) return c.json({ error: 'Invalid limit number' }, 400);

    const offset = (pageNum - 1) * limitNum;

    let selectClause = `
        SELECT
            a.*,
            u.name as user_name,
            u.email as user_email,
            s.name as service_name,
            s.api_service as service_api_service_id, /* To confirm join with api_projects */
            ap.brand_name as project_brand_name,
            ap.id as project_id
    `;
    let fromClause = `
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN services s ON a.service_id = s.id
        LEFT JOIN api_projects ap ON s.api_service = ap.id
    `;
    let countSelectClause = `SELECT COUNT(a.id) as total`;

    const conditions: string[] = [];
    const params: any[] = []; // For the main query
    const countParams: any[] = []; // For the count query

    if (date_start) {
        conditions.push('a.date >= ?');
        params.push(date_start);
        countParams.push(date_start);
    }
    if (date_end) {
        conditions.push('a.date <= ?');
        params.push(date_end);
        countParams.push(date_end);
    }
    if (api_service_id) { // This filters by project_id
        conditions.push('s.api_service = ?');
        params.push(api_service_id);
        countParams.push(api_service_id);
    }
    if (service_id) {
        conditions.push('a.service_id = ?');
        params.push(service_id);
        countParams.push(service_id);
    }
    if (status) {
        conditions.push('a.status = ?');
        params.push(status);
        countParams.push(status);
    }
    if (user_query) {
        conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
        const likeQuery = `%${user_query}%`;
        params.push(likeQuery, likeQuery);
        countParams.push(likeQuery, likeQuery);
    }

    let whereClause = '';
    if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    const mainQuery = selectClause + fromClause + whereClause + ' ORDER BY a.date DESC, a.start_time DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const countQueryString = countSelectClause + fromClause + whereClause;

    try {
        const db = c.env.DB;
        const [results, totalResult] = await Promise.all([
            db.prepare(mainQuery).bind(...params).all(),
            db.prepare(countQueryString).bind(...countParams).first('total')
        ]);

        const total = typeof totalResult === 'number' ? totalResult : ( (totalResult as any)?.total || 0);


        return c.json({
            success: true,
            data: results.results || [],
            pagination: {
                total_items: total,
                current_page: pageNum,
                items_per_page: limitNum,
                total_pages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error('Error fetching admin appointments:', error);
        return c.json({
            error: 'Failed to fetch appointments data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
  }
}

export default AppointmentController;