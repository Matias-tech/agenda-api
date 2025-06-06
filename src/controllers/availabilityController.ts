import { Context } from 'hono';
import { Env, Availability } from '../types';
import { DatabaseService } from '../utils/database';
import { generateUniqueId } from '../utils/helpers';

export class AvailabilityController {
  private dbService: DatabaseService;

  constructor(env: Env) {
    this.dbService = new DatabaseService(env.DB);
  } async getAvailability(c: Context) {
    const date = c.req.query('date');
    const api_service = c.req.query('api_service');
    const user_id = c.req.query('user_id');

    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    try {
      let query = 'SELECT * FROM availability WHERE date = ? AND is_available = TRUE';
      const params = [date];

      if (api_service) {
        query += ' AND api_service = ?';
        params.push(api_service);
      }

      if (user_id) {
        query += ' AND user_id = ?';
        params.push(user_id);
      }

      query += ' ORDER BY start_time';

      const result = await c.env.DB.prepare(query).bind(...params).all();
      return c.json({ date, api_service, user_id, availability: result.results });
    } catch (error) {
      return c.json({ error: 'Failed to fetch availability' }, 500);
    }
  }

  async createAvailability(c: Context) {
    try {
      const body = await c.req.json();
      const { date, start_time, end_time, is_available = true, api_service, user_id } = body;

      if (!date || !start_time || !end_time) {
        return c.json({
          error: 'Date, start_time, and end_time are required'
        }, 400);
      }

      const id = generateUniqueId();
      const now = new Date().toISOString();

      const result = await c.env.DB.prepare(`
        INSERT INTO availability (id, date, start_time, end_time, is_available, api_service, user_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, date, start_time, end_time, is_available, api_service || null, user_id || null, now).run();

      const newAvailability: Availability = {
        id,
        date,
        start_time,
        end_time,
        is_available,
        api_service,
        user_id,
        created_at: now
      };

      return c.json(newAvailability, 201);
    } catch (error) {
      return c.json({ error: 'Failed to create availability' }, 500);
    }
  }

  async updateAvailability(c: Context) {
    const id = c.req.param('id');

    try {
      const body = await c.req.json();
      const { is_available } = body;

      if (is_available === undefined) {
        return c.json({ error: 'is_available field is required' }, 400);
      }

      const result = await c.env.DB.prepare(`
        UPDATE availability SET is_available = ? WHERE id = ?
      `).bind(is_available, id).run();

      if (result.changes === 0) {
        return c.json({ error: 'Availability not found' }, 404);
      }

      return c.json({ message: 'Availability updated successfully' });
    } catch (error) {
      return c.json({ error: 'Failed to update availability' }, 500);
    }
  }
}