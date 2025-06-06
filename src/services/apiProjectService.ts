/**
 * Service class for managing CRUD operations for API projects (`api_projects`).
 * These projects define configurations for API clients, including branding for emails.
 */
export class ApiProjectService {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  /**
   * Fetches all active API projects.
   * @returns {Promise<any[]>} A promise that resolves to an array of active project objects.
   * @throws Will throw an error if the database query fails.
   */
  async getProjects(): Promise<any[]> {
    try {
      const result = await this.db.prepare('SELECT * FROM api_projects WHERE is_active = TRUE').all();
      return result.results || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      const result = await this.db.prepare('SELECT * FROM api_projects WHERE id = ? AND is_active = TRUE').bind(projectId).first();
      return result;
    } catch (error) {
      console.error(`Error fetching project with ID ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new API project or updates an existing one based on the provided ID.
   * This method performs an "UPSERT" operation.
   * @param {any} projectData - An object containing the project details.
   * @returns {Promise<any>} A promise that resolves to the created or updated project object.
   * @throws Will throw an error if the database query fails.
   */
  async createOrUpdateProject(projectData: any): Promise<any> {
    const {
      id,
      name,
      brand_name,
      logo_url,
      primary_color,
      contact_email,
      contact_phone,
      website_url,
      address,
      resend_api_key,
      from_email
    } = projectData;

    try {
      const now = new Date().toISOString();

      // Check if project exists
      const existing = await this.db.prepare('SELECT id FROM api_projects WHERE id = ?').bind(id).first();

      if (existing) {
        // Update existing project
        await this.db.prepare(`
          UPDATE api_projects SET 
            name = ?, brand_name = ?, logo_url = ?, primary_color = ?, 
            contact_email = ?, contact_phone = ?, website_url = ?, address = ?, 
            resend_api_key = ?, from_email = ?, updated_at = ?
          WHERE id = ?
        `).bind(
          name, brand_name, logo_url, primary_color,
          contact_email, contact_phone, website_url, address,
          resend_api_key, from_email, now, id
        ).run();
      } else {
        // Create new project
        await this.db.prepare(`
          INSERT INTO api_projects (
            id, name, brand_name, logo_url, primary_color, 
            contact_email, contact_phone, website_url, address, 
            resend_api_key, from_email, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `).bind(
          id, name, brand_name, logo_url, primary_color,
          contact_email, contact_phone, website_url, address,
          resend_api_key, from_email, now, now
        ).run();
      }

      // Return the updated/created project
      return await this.getProjectById(id);
    } catch (error) {
      console.error('Error creating or updating project:', error);
      throw error;
    }
  }

  /**
   * Marks an API project as inactive and deactivates its associated email templates.
   * This is a soft delete operation.
   * @param {string} projectId - The ID of the project to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   * @throws Will throw an error if the database query fails.
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Deactivate project
      await this.db.prepare('UPDATE api_projects SET is_active = 0, updated_at = ? WHERE id = ?')
        .bind(now, projectId).run();

      // Deactivate associated templates
      await this.db.prepare('UPDATE email_templates SET is_active = 0, updated_at = ? WHERE api_project_id = ?')
        .bind(now, projectId).run();

    } catch (error) {
      console.error(`Error deleting project with ID ${projectId}:`, error);
      throw error;
    }
  }
}
