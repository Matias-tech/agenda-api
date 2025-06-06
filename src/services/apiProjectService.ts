import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool();

/**
 * Service class for managing CRUD operations for API projects (`api_projects`).
 * These projects define configurations for API clients, including branding for emails.
 */
export class ApiProjectService {
  /**
   * Fetches all active API projects.
   * @returns {Promise<any[]>} A promise that resolves to an array of active project objects.
   * @throws Will throw an error if the database query fails.
   */
  async getProjects(): Promise<any[]> {
    try {
      const result = await pool.query('SELECT * FROM api_projects WHERE is_active = TRUE');
      return result.rows;
    } catch (error) {
      logger.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Fetches a specific active API project by its ID.
   * @param {string} projectId - The ID of the project to fetch.
   * @returns {Promise<any | undefined>} A promise that resolves to the project object if found and active, otherwise undefined.
   * @throws Will throw an error if the database query fails.
   */
  async getProjectById(projectId: string): Promise<any> {
    try {
      const result = await pool.query('SELECT * FROM api_projects WHERE id = $1 AND is_active = TRUE', [projectId]);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error fetching project with ID ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new API project or updates an existing one based on the provided ID.
   * This method performs an "UPSERT" operation.
   * @param {any} projectData - An object containing the project details (e.g., id, name, description).
   * @returns {Promise<any>} A promise that resolves to the created or updated project object.
   * @throws Will throw an error if the database query fails.
   */
  async createOrUpdateProject(projectData: any): Promise<any> {
    const { id, name, description } = projectData;
    try {
      // Try to update first (UPSERT)
      const result = await pool.query(
        `INSERT INTO api_projects (id, name, description, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (id) DO UPDATE SET name = $2, description = $3, updated_at = NOW()
         RETURNING *`,
        [id, name, description]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating or updating project:', error);
      throw error;
    }
  }

  /**
   * Marks an API project as inactive and deactivates its associated email templates.
   * This is a soft delete operation.
   * @param {string} projectId - The ID of the project to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   * @throws Will throw an error if the database query fails or the transaction fails.
   */
  async deleteProject(projectId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Deactivate project
      await client.query('UPDATE api_projects SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [projectId]);
      // Deactivate associated templates
      await client.query('UPDATE email_templates SET is_active = FALSE, updated_at = NOW() WHERE project_id = $1', [projectId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error deleting project with ID ${projectId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}
