import { Env, User, Appointment } from '../types';
import { generateUniqueId } from './helpers';

export class DatabaseService {
  constructor(private db: D1Database) { }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const id = generateUniqueId();
    const now = new Date().toISOString();

    const result = await this.db.prepare(`
      INSERT INTO users (id, email, name, phone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, user.email, user.name, user.phone || null, now, now).run();

    return { id, ...user, created_at: now, updated_at: now };
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    const id = generateUniqueId();
    const now = new Date().toISOString();

    const result = await this.db.prepare(`
      INSERT INTO appointments (id, user_id, service_id, date, start_time, end_time, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      appointment.user_id,
      appointment.service_id,
      appointment.date,
      appointment.start_time,
      appointment.end_time,
      appointment.status || 'pending',
      appointment.notes || null,
      now,
      now
    ).run();

    return { id, ...appointment, created_at: now, updated_at: now };
  }

  async getAvailableSlots(date: string) {
    const result = await this.db.prepare(`
      SELECT * FROM availability 
      WHERE date = ? AND is_available = TRUE
      ORDER BY start_time
    `).bind(date).all();

    return result.results;
  }

  async getAppointmentsByDate(date: string) {
    const result = await this.db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email, s.name as service_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE a.date = ?
      ORDER BY a.start_time
    `).bind(date).all();

    return result.results;
  }
}