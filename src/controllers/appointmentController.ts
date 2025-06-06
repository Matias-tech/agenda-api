import { Context } from 'hono';
import { Env, Appointment, User } from '../types';
import { DatabaseService } from '../utils/database';
import { generateUniqueId, isValidEmail } from '../utils/helpers';

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

      // Verificar que el servicio existe
      const service = await c.env.DB.prepare(`
        SELECT * FROM services WHERE id = ?
      `).bind(service_id).first();

      if (!service) {
        return c.json({ error: 'Service not found' }, 404);
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
        SELECT a.*, u.name as user_name, u.email as user_email, s.name as service_name, s.duration, s.api_service, s.user_id as responsible_user_id
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

      if (responsible_user_id) {
        conditions.push('s.user_id = ?');
        params.push(responsible_user_id);
      }

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
      const result = await c.env.DB.prepare(`
        UPDATE appointments 
        SET status = 'confirmed', updated_at = ? 
        WHERE id = ? AND status = 'pending'
      `).bind(new Date().toISOString(), appointmentId).run();

      if (result.changes === 0) {
        return c.json({ error: 'Appointment not found or already processed' }, 404);
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
      const result = await c.env.DB.prepare(`
        UPDATE appointments 
        SET status = 'cancelled', updated_at = ? 
        WHERE id = ? AND status != 'cancelled'
      `).bind(new Date().toISOString(), appointmentId).run();

      if (result.changes === 0) {
        return c.json({ error: 'Appointment not found or already cancelled' }, 404);
      }

      return c.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return c.json({ error: 'Failed to cancel appointment' }, 500);
    }
  }
}

export default AppointmentController;