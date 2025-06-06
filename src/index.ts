import { Hono } from 'hono'
import { authMiddleware } from './middleware/auth'
import { validationMiddleware } from './middleware/validation'
import routes from './routes'
import test from './routes/test'
import { Env } from './types'
import { handleScheduledReminders } from './services/reminderService'

const app = new Hono<{ Bindings: Env }>()

app.use('*', authMiddleware)
app.use('*', validationMiddleware)

app.route('/api', routes)
app.route('/form-preview', test)

// Panel de administración de correos
app.get('/admin', (c) => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Gestión de Correos - Agenda API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f6fa;
            color: #2c3e50;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
            border: 1px solid #e1e8ed;
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #f1f3f4;
        }
        
        .card-icon {
            font-size: 1.5rem;
            margin-right: 0.5rem;
        }
        
        .card-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #3498db;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .project-selector {
            margin-bottom: 1rem;
        }
        
        .project-selector select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            background: white;
        }
        
        .project-selector select:focus {
            outline: none;
            border-color: #3498db;
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        
        .btn-primary {
            background: #3498db;
            color: white;
        }
        
        .btn-primary:hover {
            background: #2980b9;
            transform: translateY(-1px);
        }
        
        .btn-success {
            background: #27ae60;
            color: white;
        }
        
        .btn-success:hover {
            background: #229954;
        }
        
        .btn-warning {
            background: #f39c12;
            color: white;
        }
        
        .btn-warning:hover {
            background: #e67e22;
        }
        
        .btn-danger {
            background: #e74c3c;
            color: white;
        }
        
        .btn-danger:hover {
            background: #c0392b;
        }
        
        .btn-small {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }
        
        .color-preview {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #ddd;
            margin-left: 0.5rem;
            vertical-align: middle;
        }
        
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .template-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .template-type {
            font-weight: 600;
            color: #495057;
            margin-bottom: 0.5rem;
        }
        
        .logs-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .logs-table th,
        .logs-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        .logs-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 2rem;
            color: #6c757d;
        }
        
        .email-preview {
            margin-top: 1rem;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .email-preview-header {
            background: #f8f9fa;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
        }
        
        .email-preview-body {
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .refresh-btn {
            float: right;
            margin-left: 1rem;
        }
        
        .section-full {
            grid-column: 1 / -1;
        }
        
        .projects-card-full {
            grid-column: 1 / -1;
        }
        
        @media (max-width: 1024px) and (min-width: 769px) {
            .modal-body form > div {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .modal-content {
                width: 98%;
                margin: 1% auto;
                max-height: 98vh;
            }
            
            .modal-body form > div {
                grid-template-columns: 1fr !important;
            }
            
            .form-group[style*="grid-column"] {
                grid-column: 1 / -1 !important;
            }
            
            .header {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
        }
        
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        
        .alert-info {
            background-color: #d1ecf1;
            border-color: #bee5eb;
            color: #0c5460;
        }
        
        .alert-success {
            background-color: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }
        
        .alert-warning {
            background-color: #fff3cd;
            border-color: #ffeaa7;
            color: #856404;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }

        .modal-content {
            background-color: white;
            margin: 2% auto;
            padding: 0;
            border-radius: 12px;
            width: 95%;
            max-width: 1200px;
            max-height: 95vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 12px 12px 0 0;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 1.3rem;
        }

        .modal-body {
            padding: 2rem;
        }

        .modal-footer {
            padding: 1rem 2rem 2rem;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        .close {
            color: white;
            float: right;
            font-size: 2rem;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        }

        .close:hover {
            opacity: 0.7;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2c3e50;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            background: white;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #3498db;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .form-group small {
            color: #6c757d;
            font-size: 0.8rem;
        }

        .project-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .btn-small {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }

        .btn-danger {
            background: #e74c3c;
            color: white;
        }

        .btn-danger:hover {
            background: #c0392b;
        }

        .color-preview {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            display: inline-block;
            margin-left: 0.5rem;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 Panel de Gestión de Correos - Agenda API</h1>
    </div>
    
    <div class="container">
        <!-- Estadísticas Generales -->
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h2 class="card-title">Estadísticas Generales</h2>
                    <button class="btn btn-primary refresh-btn" onclick="loadStats()">🔄 Actualizar</button>
                </div>
                <div id="general-stats">
                    <div class="loading">Cargando estadísticas...</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <span class="card-icon">⏰</span>
                    <h2 class="card-title">Recordatorios</h2>
                </div>
                <div id="reminders-info">
                    <p class="stat-label">Próximo envío: 18:00 hrs</p>
                    <button class="btn btn-warning" onclick="sendReminders()">📤 Enviar Recordatorios Ahora</button>
                </div>
            </div>
        </div>
        
        <!-- Gestión de Proyectos - Full Width -->
        <div class="dashboard-grid">
            <div class="card projects-card-full">
                <div class="card-header">
                    <span class="card-icon">🏢</span>
                    <h2 class="card-title">Gestión de Proyectos</h2>
                    <button class="btn btn-success refresh-btn" onclick="showProjectModal()">➕ Nuevo Proyecto</button>
                </div>
                <div id="projects-list">
                    <div class="loading">Cargando proyectos...</div>
                </div>
            </div>
        </div>
        
        <!-- Selector de Proyecto y Templates -->
        <div class="dashboard-grid">
            <div class="card section-full">
                <div class="card-header">
                    <span class="card-icon">📝</span>
                    <h2 class="card-title">Gestión de Templates</h2>
                </div>
                
                <div class="project-selector">
                    <label for="project-select">Seleccionar Proyecto:</label>
                    <select id="project-select" onchange="loadProjectTemplates()">
                        <option value="">Seleccione un proyecto...</option>
                    </select>
                </div>
                
                <div id="templates-section" style="display: none;">
                    <div class="template-grid" id="templates-grid">
                        <!-- Templates se cargarán aquí -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Previsualización de Correos -->
        <div class="dashboard-grid">
            <div class="card section-full">
                <div class="card-header">
                    <span class="card-icon">👁️</span>
                    <h2 class="card-title">Previsualización de Correos</h2>
                </div>
                
                <div id="email-preview-section" style="display: none;">
                    <div class="email-preview" id="email-preview">
                        <!-- Preview se cargará aquí -->
                    </div>
                </div>
                
                <div id="no-preview" class="alert alert-info">
                    <strong>💡 Consejo:</strong> Seleccione un proyecto arriba y haga clic en "Previsualizar" en cualquier template para ver cómo se verá el correo.
                </div>
            </div>
        </div>
        
        <!-- Logs de Correos -->
        <div class="dashboard-grid">
            <div class="card section-full">
                <div class="card-header">
                    <span class="card-icon">📋</span>
                    <h2 class="card-title">Registro de Correos Enviados</h2>
                    <button class="btn btn-primary refresh-btn" onclick="loadEmailLogs()">🔄 Actualizar</button>
                </div>
                
                <div id="email-logs">
                    <div class="loading">Cargando logs...</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal para Gestión de Proyectos -->
    <div id="projectModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="close" onclick="closeProjectModal()">&times;</span>
                <h3 id="modalTitle">Nuevo Proyecto</h3>
            </div>
            <div class="modal-body">
                <form id="projectForm">
                    <div class="form-group">
                        <label for="projectId">ID del Proyecto *</label>
                        <input type="text" id="projectId" name="id" required 
                               placeholder="ej: inmobiliaria, clinica, consultoria">
                        <small>ID único para identificar el proyecto (solo letras, números y guiones)</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="projectName">Nombre Interno</label>
                        <input type="text" id="projectName" name="name" 
                               placeholder="Nombre interno del proyecto">
                    </div>
                    
                    <div class="form-group">
                        <label for="brandName">Nombre de la Marca *</label>
                        <input type="text" id="brandName" name="brand_name" required 
                               placeholder="ej: ClínicaDental Sonrisa">
                    </div>
                    
                    <div class="form-group">
                        <label for="logoUrl">URL del Logo</label>
                        <input type="url" id="logoUrl" name="logo_url" 
                               placeholder="https://ejemplo.com/logo.png">
                    </div>
                    
                    <div class="form-group">
                        <label for="primaryColor">Color Primario *</label>
                        <input type="color" id="primaryColor" name="primary_color" value="#3498db" required>
                        <span class="color-preview" id="colorPreview"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="contactEmail">Email de Contacto *</label>
                        <input type="email" id="contactEmail" name="contact_email" required 
                               placeholder="contacto@ejemplo.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="contactPhone">Teléfono de Contacto</label>
                        <input type="tel" id="contactPhone" name="contact_phone" 
                               placeholder="+56 9 1234 5678">
                    </div>
                    
                    <div class="form-group">
                        <label for="websiteUrl">Sitio Web</label>
                        <input type="url" id="websiteUrl" name="website_url" 
                               placeholder="https://ejemplo.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Dirección</label>
                        <textarea id="address" name="address" 
                                  placeholder="Dirección completa del negocio"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="resendApiKey">API Key de Resend</label>
                        <input type="password" id="resendApiKey" name="resend_api_key" 
                               placeholder="re_TU_API_KEY_DE_RESEND">
                        <small>Dejar vacío para mantener la clave actual (al editar)</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="fromEmail">Email Remitente *</label>
                        <input type="email" id="fromEmail" name="from_email" required 
                               placeholder="noreply@ejemplo.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="isActive">Estado</label>
                        <select id="isActive" name="is_active">
                            <option value="1">Activo</option>
                            <option value="0">Inactivo</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" onclick="saveProject()">💾 Guardar</button>
                <button type="button" class="btn" onclick="closeProjectModal()">❌ Cancelar</button>
            </div>
        </div>
    </div>
    
    <script>
// Dashboard JavaScript para el Panel de Gestión de Correos
class EmailDashboard {
    constructor() {
        this.baseUrl = window.location.origin;
        this.currentProject = null;
        this.projects = [];
        this.init();
    }

    async init() {
        await this.loadProjects();
        await this.loadStats();
        await this.loadEmailLogs();
    }

    // Cargar proyectos disponibles
    async loadProjects() {
        try {
            console.log('📡 Cargando proyectos desde:', \`\${this.baseUrl}/api/emails/projects\`);
            const response = await fetch(\`\${this.baseUrl}/api/emails/projects\`);
            console.log('📡 Response status:', response.status);
            
            const data = await response.json();
            console.log('📡 Response data:', data);
            
            if (data.success) {
                this.projects = data.projects;
                console.log('📡 Proyectos cargados:', this.projects.length);
                this.renderProjects();
                this.populateProjectSelector();
            } else {
                console.error('❌ Error en respuesta:', data);
                this.showError('Error al cargar proyectos: ' + (data.error || 'Respuesta no exitosa'));
            }
        } catch (error) {
            console.error('❌ Error cargando proyectos:', error);
            this.showError('Error al cargar proyectos');
        }
    }

    // Renderizar lista de proyectos
    renderProjects() {
        console.log('🎨 Renderizando proyectos:', this.projects.length);
        const container = document.getElementById('projects-list');
        console.log('🎨 Container encontrado:', !!container);
        
        if (this.projects.length === 0) {
            container.innerHTML = \`
                <p class="stat-label">No hay proyectos configurados</p>
                <button class="btn btn-success" onclick="showProjectModal()" style="margin-top: 1rem;">
                    ➕ Nuevo Proyecto
                </button>
            \`;
            console.log('🎨 Renderizado: Sin proyectos');
            return;
        }

        const projectsHtml = \`
            <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #2c3e50;">Proyectos Configurados (\${this.projects.length})</h3>
                <button class="btn btn-success" onclick="showProjectModal()">
                    ➕ Nuevo Proyecto
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
                \${this.projects.map(project => \`
                    <div style="padding: 1.5rem; border: 1px solid #ddd; border-radius: 12px; background: #f8f9fa; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" 
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <strong style="font-size: 1.1rem; color: #2c3e50;">\${project.brand_name}</strong>
                                <span style="background: \${project.is_active ? '#27ae60' : '#e74c3c'}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: bold;">
                                    \${project.is_active ? '✅ Activo' : '❌ Inactivo'}
                                </span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <small class="stat-label"><strong>ID:</strong> \${project.id}</small>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <small class="stat-label"><strong>Email:</strong> \${project.from_email}</small>
                            </div>
                            \${project.contact_email ? \`
                                <div style="margin-bottom: 0.5rem;">
                                    <small class="stat-label"><strong>Contacto:</strong> \${project.contact_email}</small>
                                </div>
                            \` : ''}
                            \${project.website_url ? \`
                                <div style="margin-bottom: 0.5rem;">
                                    <small class="stat-label"><strong>Web:</strong> <a href="\${project.website_url}" target="_blank" style="color: #3498db;">\${project.website_url}</a></small>
                                </div>
                            \` : ''}
                        </div>
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <button class="btn btn-primary btn-small" onclick="editProject('\${project.id}')" title="Editar Proyecto" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-danger btn-small" onclick="deleteProject('\${project.id}')" title="Eliminar Proyecto" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                \`).join('')}
            </div>
        \`;

        container.innerHTML = projectsHtml;
    }

    // Poblar selector de proyectos
    populateProjectSelector() {
        const select = document.getElementById('project-select');
        
        // Limpiar opciones existentes excepto la primera
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = \`\${project.brand_name} (\${project.id})\`;
            select.appendChild(option);
        });
    }

    // Cargar estadísticas generales
    async loadStats() {
        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/stats?days=7\`);
            const data = await response.json();
            
            if (data.success) {
                this.renderStats(data);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.showError('Error al cargar estadísticas');
        }
    }

    // Renderizar estadísticas
    renderStats(data) {
        const container = document.getElementById('general-stats');
        
        const statsHtml = \`
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <div class="stat-number">\${data.summary.total_emails}</div>
                    <div class="stat-label">Correos enviados (7 días)</div>
                </div>
                <div>
                    <div class="stat-number">\${data.summary.unique_appointments}</div>
                    <div class="stat-label">Citas únicas</div>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <div class="stat-number">\${data.summary.active_projects}</div>
                <div class="stat-label">Proyectos activos</div>
            </div>
        \`;
        
        container.innerHTML = statsHtml;
    }

    // Cargar templates de un proyecto
    async loadProjectTemplates() {
        const projectId = document.getElementById('project-select').value;
        
        if (!projectId) {
            document.getElementById('templates-section').style.display = 'none';
            return;
        }

        this.currentProject = projectId;
        
        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/templates/\${projectId}\`);
            const data = await response.json();
            
            if (data.success) {
                this.renderTemplates(data.templates);
                document.getElementById('templates-section').style.display = 'block';
            }
        } catch (error) {
            console.error('Error cargando templates:', error);
            this.showError('Error al cargar templates');
        }
    }

    // Renderizar templates
    renderTemplates(templates) {
        const container = document.getElementById('templates-grid');
        
        if (templates.length === 0) {
            container.innerHTML = \`
                <div class="template-card">
                    <p>No hay templates configurados</p>
                    <button class="btn btn-success" onclick="dashboard.initializeTemplates('\${this.currentProject}')">
                        🚀 Inicializar Templates
                    </button>
                </div>
            \`;
            return;
        }

        const templatesHtml = templates.map(template => {
            const typeNames = {
                'appointment_confirmation': '✅ Confirmación',
                'appointment_reminder': '⏰ Recordatorio',
                'appointment_cancellation': '❌ Cancelación',
                'appointment_pending': '📝 Pendiente',
                'appointment_rescheduled': '📅 Reagendado'
            };

            return \`
                <div class="template-card">
                    <div class="template-type">\${typeNames[template.email_type] || template.email_type}</div>
                    <small class="stat-label">ID: \${template.id}</small>
                    <br><br>
                    <button class="btn btn-primary" onclick="dashboard.previewTemplate('\${this.currentProject}', '\${template.email_type}')">
                        👁️ Previsualizar
                    </button>
                </div>
            \`;
        }).join('');

        container.innerHTML = templatesHtml;
    }

    // Inicializar templates predeterminados
    async initializeTemplates(projectId) {
        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/templates/init/\${projectId}\`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess(\`Templates inicializados: \${data.created} creados\`);
                await this.loadProjectTemplates();
            } else {
                this.showError(data.message || 'Error al inicializar templates');
            }
        } catch (error) {
            console.error('Error inicializando templates:', error);
            this.showError('Error al inicializar templates');
        }
    }

    // Previsualizar template
    async previewTemplate(projectId, emailType) {
        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/templates/preview/\${projectId}/\${emailType}\`);
            const data = await response.json();
            
            this.renderEmailPreview(data);
            document.getElementById('email-preview-section').style.display = 'block';
            document.getElementById('no-preview').style.display = 'none';
            
            // Scroll to preview
            document.getElementById('email-preview-section').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error en preview:', error);
            this.showError('Error al cargar preview');
        }
    }

    // Renderizar preview de correo
    renderEmailPreview(data) {
        const container = document.getElementById('email-preview');
        
        const previewHtml = \`
            <div class="email-preview-header">
                <strong>📧 Asunto:</strong> \${data.subject}
                <br>
                <small class="stat-label">Template: \${data.template_info.id} | Actualizado: \${data.template_info.updated_at}</small>
            </div>
            <div class="email-preview-body">
                <div style="border: 1px solid #ddd; border-radius: 4px; padding: 1rem; background: white;">
                    \${data.html}
                </div>
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; font-weight: bold;">📝 Versión de texto plano</summary>
                    <pre style="background: #f8f9fa; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; white-space: pre-wrap;">\${data.text}</pre>
                </details>
            </div>
        \`;
        
        container.innerHTML = previewHtml;
    }

    // Cargar logs de correos
    async loadEmailLogs() {
        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/stats?days=7\`);
            const data = await response.json();
            
            if (data.success) {
                this.renderEmailLogs(data.details);
            }
        } catch (error) {
            console.error('Error cargando logs:', error);
            this.showError('Error al cargar logs');
        }
    }

    // Renderizar logs de correos
    renderEmailLogs(logs) {
        const container = document.getElementById('email-logs');
        
        if (!logs || logs.length === 0) {
            container.innerHTML = \`
                <div class="alert alert-info">
                    <strong>ℹ️ Información:</strong> No hay registros de correos enviados en los últimos 7 días.
                </div>
            \`;
            return;
        }

        const logsHtml = \`
            <table class="logs-table">
                <thead>
                    <tr>
                        <th>Fecha/Hora</th>
                        <th>Proyecto</th>
                        <th>Tipo</th>
                        <th>Destinatario</th>
                        <th>Estado</th>
                        <th>ID Cita</th>
                    </tr>
                </thead>
                <tbody>
                    \${logs.map(log => \`
                        <tr>
                            <td>\${this.formatDate(log.sent_at)}</td>
                            <td>\${log.project_id}</td>
                            <td>\${log.email_type}</td>
                            <td>\${log.to_email}</td>
                            <td>
                                <span class="status-badge status-\${log.status === 'sent' ? 'success' : 'error'}">
                                    \${log.status === 'sent' ? '✅ Enviado' : '❌ Error'}
                                </span>
                            </td>
                            <td>\${log.appointment_id}</td>
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        \`;
        
        container.innerHTML = logsHtml;
    }

    // Enviar recordatorios manualmente
    async sendReminders() {
        if (!confirm('¿Está seguro de que desea enviar los recordatorios ahora?')) {
            return;
        }

        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/reminders/send\`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess(\`Recordatorios enviados: \${data.sent} correos, \${data.errors} errores\`);
                await this.loadEmailLogs();
            } else {
                this.showError(data.message || 'Error al enviar recordatorios');
            }
        } catch (error) {
            console.error('Error enviando recordatorios:', error);
            this.showError('Error al enviar recordatorios');
        }
    }

    // Formatear fecha
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Mostrar mensaje de éxito
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // Mostrar mensaje de error
    showError(message) {
        this.showMessage(message, 'warning');
    }

    // Mostrar mensaje
    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = \`alert alert-\${type}\`;
        alertDiv.innerHTML = \`
            <strong>\${type === 'success' ? '✅ Éxito:' : '⚠️ Error:'}</strong> \${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">×</button>
        \`;
        
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.dashboard-grid'));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Gestión de proyectos
    async showProjectModal(projectId = null) {
        const isEdit = projectId !== null;
        
        let projectData = {
            id: '',
            name: '',
            brand_name: '',
            logo_url: '',
            primary_color: '#007bff',
            contact_email: '',
            contact_phone: '',
            website_url: '',
            address: '',
            from_email: '',
            resend_api_key: ''
        };

        if (isEdit) {
            try {
                const response = await fetch(\`\${this.baseUrl}/api/emails/projects/\${projectId}\`);
                const data = await response.json();
                if (data.success) {
                    projectData = data.project;
                }
            } catch (error) {
                this.showError('Error cargando datos del proyecto');
                return;
            }
        }

        const modalHtml = \`
            <div id="projectModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <span class="close" onclick="dashboard.closeProjectModal()">&times;</span>
                        <h3>\${isEdit ? '✏️ Editar Proyecto' : '➕ Nuevo Proyecto'}</h3>
                    </div>
                    <div class="modal-body">
                        <form id="projectForm" onsubmit="dashboard.saveProject(event, \${isEdit}); return false;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                                <div class="form-group">
                                    <label for="projectId">ID del Proyecto *</label>
                                    <input type="text" id="projectId" name="id" value="\${projectData.id}" 
                                           required \${isEdit ? 'readonly' : ''} 
                                           placeholder="ej: inmobiliaria, clinica">
                                    <small>ID único para identificar el proyecto (solo letras, números y guiones)</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="projectName">Nombre Interno</label>
                                    <input type="text" id="projectName" name="name" value="\${projectData.name}" 
                                           placeholder="Nombre interno del proyecto">
                                </div>
                                
                                <div class="form-group">
                                    <label for="brandName">Nombre de la Marca *</label>
                                    <input type="text" id="brandName" name="brand_name" value="\${projectData.brand_name}" 
                                           required placeholder="ej: ClínicaDental Sonrisa">
                                </div>
                                
                                <div class="form-group">
                                    <label for="logoUrl">URL del Logo</label>
                                    <input type="url" id="logoUrl" name="logo_url" value="\${projectData.logo_url}" 
                                           placeholder="https://ejemplo.com/logo.png">
                                </div>
                                
                                <div class="form-group">
                                    <label for="primaryColor">Color Primario *</label>
                                    <input type="color" id="primaryColor" name="primary_color" value="\${projectData.primary_color}" required>
                                    <span class="color-preview" id="colorPreview"></span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="contactEmail">Email de Contacto *</label>
                                    <input type="email" id="contactEmail" name="contact_email" value="\${projectData.contact_email}" 
                                           required placeholder="contacto@ejemplo.com">
                                </div>
                                
                                <div class="form-group">
                                    <label for="contactPhone">Teléfono de Contacto</label>
                                    <input type="tel" id="contactPhone" name="contact_phone" value="\${projectData.contact_phone}" 
                                           placeholder="+56 9 1234 5678">
                                </div>
                                
                                <div class="form-group">
                                    <label for="websiteUrl">Sitio Web</label>
                                    <input type="url" id="websiteUrl" name="website_url" value="\${projectData.website_url}" 
                                           placeholder="https://ejemplo.com">
                                </div>
                                
                                <div class="form-group">
                                    <label for="fromEmail">Email Remitente *</label>
                                    <input type="email" id="fromEmail" name="from_email" value="\${projectData.from_email}" 
                                           required placeholder="noreply@ejemplo.com">
                                </div>
                                
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="address">Dirección</label>
                                    <textarea id="address" name="address" 
                                              placeholder="Dirección completa del negocio">\${projectData.address}</textarea>
                                </div>
                                
                                <div class="form-group" style="grid-column: 1 / span 2;">
                                    <label for="resendApiKey">API Key de Resend</label>
                                    <input type="password" id="resendApiKey" name="resend_api_key" value="\${projectData.resend_api_key}" 
                                           placeholder="re_TU_API_KEY_DE_RESEND">
                                    <small>Dejar vacío para mantener la clave actual (al editar)</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="isActive">Estado</label>
                                    <select id="isActive" name="is_active">
                                        <option value="1" \${projectData.is_active ? 'selected' : ''}>Activo</option>
                                        <option value="0" \${!projectData.is_active ? 'selected' : ''}>Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" form="projectForm" class="btn btn-primary">💾 Guardar</button>
                        <button type="button" class="btn" onclick="dashboard.closeProjectModal()">❌ Cancelar</button>
                    </div>
                </div>
            </div>
        \`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeProjectModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.remove();
        }
    }

    async saveProject(event = null, isEdit = false) {
        if (event) {
            event.preventDefault();
        }
        
        // Obtener el formulario
        const form = document.getElementById('projectForm');
        if (!form) {
            this.showError('Formulario no encontrado');
            return;
        }
        
        const formData = new FormData(form);
        const projectData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/projects\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(\`Proyecto \${isEdit ? 'actualizado' : 'creado'} exitosamente\`);
                this.closeProjectModal();
                await this.loadProjects();
            } else {
                this.showError(result.error || 'Error guardando el proyecto');
            }
        } catch (error) {
            console.error('Error guardando proyecto:', error);
            this.showError('Error guardando el proyecto');
        }

        return false;
    }

    async deleteProject(projectId) {
        if (!confirm(\`¿Está seguro de que desea eliminar el proyecto "\${projectId}"?\`)) {
            return;
        }

        try {
            const response = await fetch(\`\${this.baseUrl}/api/emails/projects/\${projectId}\`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Proyecto eliminado exitosamente');
                await this.loadProjects();
            } else {
                this.showError(result.error || 'Error eliminando el proyecto');
            }
        } catch (error) {
            console.error('Error eliminando proyecto:', error);
            this.showError('Error eliminando el proyecto');
        }
    }
}

// Inicializar dashboard
const dashboard = new EmailDashboard();

// Funciones globales para eventos
function loadStats() {
    dashboard.loadStats();
}

function loadEmailLogs() {
    dashboard.loadEmailLogs();
}

function sendReminders() {
    dashboard.sendReminders();
}

function loadProjectTemplates() {
    dashboard.loadProjectTemplates();
}

function showProjectModal(projectId = null) {
    dashboard.showProjectModal(projectId);
}

function editProject(projectId) {
    dashboard.showProjectModal(projectId);
}

function deleteProject(projectId) {
    dashboard.deleteProject(projectId);
}

function closeProjectModal() {
    dashboard.closeProjectModal();
}

function saveProject() {
    const form = document.getElementById('projectForm');
    const event = new Event('submit');
    dashboard.saveProject(event, false);
}

// Auto-refresh cada 30 segundos
setInterval(() => {
    dashboard.loadStats();
}, 30000);
    </script>
</body>
</html>`
  return c.html(html)
})

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to the Appointment API!',
    version: '1.0.0',
    endpoints: {
      appointments: '/api/appointments',
      availability: '/api/availability',
      emails: '/api/emails',
      testForms: '/form-preview',
      emailDashboard: '/admin'
    }
  })
})

export default {
  fetch: app.fetch,

  // Cron job para enviar recordatorios diarios
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (controller.cron) {
      case '0 18 * * *': // Todos los días a las 6:00 PM
        console.log('🕕 Ejecutando envío de recordatorios...')
        try {
          const response = await handleScheduledReminders(env)
          const result = await response.json()
          console.log('📧 Recordatorios completados:', result)
        } catch (error) {
          console.error('❌ Error en cron job de recordatorios:', error)
        }
        break
      default:
        console.log('⚠️ Cron job no reconocido:', controller.cron)
    }
  },
}