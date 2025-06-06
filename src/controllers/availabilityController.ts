import { Context } from 'hono';
import { Env, Availability } from '../types';
import { DatabaseService } from '../utils/database';
import { generateUniqueId } from '../utils/helpers';

export class AvailabilityController {
  private dbService: DatabaseService;

  constructor(env: Env) {
    this.dbService = new DatabaseService(env.DB);
  }

  // Admin endpoint to get availability with filters and pagination
  async getAdminAvailability(c: Context) {
    const {
      page = '1',
      limit = '20',
      start_date,
      end_date,
      api_service,
      user_id,
      is_available
    } = c.req.query();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return c.json({ error: 'Invalid page number' }, 400);
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return c.json({ error: 'Invalid limit number' }, 400);
    }

    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM availability';
    let countQuery = 'SELECT COUNT(*) as total FROM availability';
    const conditions: string[] = [];
    const params: any[] = [];
    const countParams: any[] = [];

    if (start_date) {
      conditions.push('date >= ?');
      params.push(start_date);
      countParams.push(start_date);
    }
    if (end_date) {
      conditions.push('date <= ?');
      params.push(end_date);
      countParams.push(end_date);
    }
    if (api_service) {
      conditions.push('api_service = ?');
      params.push(api_service);
      countParams.push(api_service);
    }
    if (user_id) {
      conditions.push('user_id = ?');
      params.push(user_id);
      countParams.push(user_id);
    }
    if (is_available !== undefined && is_available !== 'all') {
        if (is_available === 'true' || is_available === '1') {
            conditions.push('is_available = TRUE');
        } else if (is_available === 'false' || is_available === '0') {
            conditions.push('is_available = FALSE');
        } else {
            return c.json({ error: "Invalid is_available value. Use 'true', 'false', or 'all'." }, 400);
        }
    }


    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date, start_time LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    try {
      const [results, totalResult] = await Promise.all([
        c.env.DB.prepare(query).bind(...params).all(),
        c.env.DB.prepare(countQuery).bind(...countParams).first('total')
      ]);

      const total = typeof totalResult === 'number' ? totalResult : 0;


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
      console.error('Error fetching admin availability:', error);
      return c.json({ error: 'Failed to fetch availability data', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  }

  async getAvailability(c: Context) {
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
    if (!id) {
        return c.json({ error: 'Availability ID is required' }, 400);
    }

    try {
        const body = await c.req.json();
        const { date, start_time, end_time, is_available, api_service, user_id } = body;

        const updateFields: string[] = [];
        const params: any[] = [];

        if (date !== undefined) {
            // Add date validation if necessary, e.g., YYYY-MM-DD format
            updateFields.push('date = ?');
            params.push(date);
        }
        if (start_time !== undefined) {
            // Add time validation if necessary, e.g., HH:MM format
            updateFields.push('start_time = ?');
            params.push(start_time);
        }
        if (end_time !== undefined) {
            // Add time validation if necessary, e.g., HH:MM format
            updateFields.push('end_time = ?');
            params.push(end_time);
        }
        if (is_available !== undefined) {
            updateFields.push('is_available = ?');
            params.push(is_available ? 1 : 0); // Ensure boolean is converted to integer for SQLite
        }
        if (api_service !== undefined) {
            updateFields.push('api_service = ?');
            params.push(api_service); // Can be null to remove
        }
        if (user_id !== undefined) {
            updateFields.push('user_id = ?');
            params.push(user_id); // Can be null to remove
        }

        if (updateFields.length === 0) {
            return c.json({ error: 'At least one field to update must be provided' }, 400);
        }

        updateFields.push('updated_at = ?');
        params.push(new Date().toISOString());
        params.push(id); // For the WHERE clause

        const query = `UPDATE availability SET ${updateFields.join(', ')} WHERE id = ?`;

        // First, check if the record exists
        const existing = await c.env.DB.prepare('SELECT id FROM availability WHERE id = ?').bind(id).first();
        if (!existing) {
            return c.json({ error: 'Availability slot not found' }, 404);
        }

        const result = await c.env.DB.prepare(query).bind(...params).run();

        if (result.changes === 0) {
            // This might happen if the data provided is the same as existing data,
            // or if the ID was found initially but somehow gone before update (race condition, unlikely here)
            // For now, we can treat it as "no effective change" or potentially re-fetch to confirm.
            // Let's assume if `existing` check passed, this means no actual data changed.
             return c.json({ message: 'Availability update attempted, but no changes were made or record not found.', success: false }, 404);
        }

        // Fetch the updated record to return it
        const updatedAvailability = await c.env.DB.prepare('SELECT * FROM availability WHERE id = ?').bind(id).first();

        return c.json({ message: 'Availability updated successfully', success: true, data: updatedAvailability });
    } catch (error) {
      console.error('Failed to update availability:', error);
      return c.json({ error: 'Failed to update availability', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  }

  async deleteAvailability(c: Context) {
    const id = c.req.param('id');
    if (!id) {
        return c.json({ error: 'Availability ID is required' }, 400);
    }

    try {
        // Check if the slot exists
        const existing = await c.env.DB.prepare('SELECT id FROM availability WHERE id = ?').bind(id).first();
        if (!existing) {
            return c.json({ error: 'Availability slot not found' }, 404);
        }

        const result = await c.env.DB.prepare('DELETE FROM availability WHERE id = ?').bind(id).run();

        if (result.changes === 0) {
             // Should not happen if `existing` check passed, but as a safeguard
            return c.json({ error: 'Failed to delete availability slot, or slot not found.', success: false }, 404);
        }

        return c.json({ message: 'Availability slot deleted successfully', success: true });
    } catch (error) {
        console.error('Failed to delete availability:', error);
        // Consider specific error codes for foreign key constraints if appointments depend on this
        return c.json({ error: 'Failed to delete availability slot', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  }
}