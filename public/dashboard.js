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
            const response = await fetch(`${this.baseUrl}/api/emails/projects`);
            const data = await response.json();

            if (data.success) {
                this.projects = data.projects;
                this.renderProjects();
                this.populateProjectSelector();
            }
        } catch (error) {
            console.error('Error cargando proyectos:', error);
            this.showError('Error al cargar proyectos');
        }
    }

    // Renderizar lista de proyectos
    renderProjects() {
        const container = document.getElementById('projects-list');

        if (this.projects.length === 0) {
            container.innerHTML = '<p class="stat-label">No hay proyectos configurados</p>';
            return;
        }

        const projectsHtml = this.projects.map(project => `
            <div style="margin-bottom: 0.5rem;">
                <strong>${project.brand_name}</strong>
                <br>
                <small class="stat-label">${project.id} • ${project.is_active ? '✅ Activo' : '❌ Inactivo'}</small>
            </div>
        `).join('');

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
            option.textContent = `${project.brand_name} (${project.id})`;
            select.appendChild(option);
        });
    }

    // Cargar estadísticas generales
    async loadStats() {
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/stats?days=7`);
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

        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <div class="stat-number">${data.summary.total_emails}</div>
                    <div class="stat-label">Correos enviados (7 días)</div>
                </div>
                <div>
                    <div class="stat-number">${data.summary.unique_appointments}</div>
                    <div class="stat-label">Citas únicas</div>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <div class="stat-number">${data.summary.active_projects}</div>
                <div class="stat-label">Proyectos activos</div>
            </div>
        `;

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
            const response = await fetch(`${this.baseUrl}/api/emails/templates/${projectId}`);
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
            container.innerHTML = `
                <div class="template-card">
                    <p>No hay templates configurados</p>
                    <button class="btn btn-success" onclick="dashboard.initializeTemplates('${this.currentProject}')">
                        🚀 Inicializar Templates
                    </button>
                </div>
            `;
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

            return `
                <div class="template-card">
                    <div class="template-type">${typeNames[template.email_type] || template.email_type}</div>
                    <small class="stat-label">ID: ${template.id}</small>
                    <br><br>
                    <button class="btn btn-primary" onclick="dashboard.previewTemplate('${this.currentProject}', '${template.email_type}')">
                        👁️ Previsualizar
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = templatesHtml;
    }

    // Inicializar templates predeterminados
    async initializeTemplates(projectId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/templates/init/${projectId}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                this.showSuccess(`Templates inicializados: ${data.created} creados`);
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
            const response = await fetch(`${this.baseUrl}/api/emails/templates/preview/${projectId}/${emailType}`);
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

        const previewHtml = `
            <div class="email-preview-header">
                <strong>📧 Asunto:</strong> ${data.subject}
                <br>
                <small class="stat-label">Template: ${data.template_info.id} | Actualizado: ${data.template_info.updated_at}</small>
            </div>
            <div class="email-preview-body">
                <div style="border: 1px solid #ddd; border-radius: 4px; padding: 1rem; background: white;">
                    ${data.html}
                </div>
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; font-weight: bold;">📝 Versión de texto plano</summary>
                    <pre style="background: #f8f9fa; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; white-space: pre-wrap;">${data.text}</pre>
                </details>
            </div>
        `;

        container.innerHTML = previewHtml;
    }

    // Cargar logs de correos
    async loadEmailLogs() {
        try {
            const response = await fetch(`${this.baseUrl}/api/emails/stats?days=7`);
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
            container.innerHTML = `
                <div class="alert alert-info">
                    <strong>ℹ️ Información:</strong> No hay registros de correos enviados en los últimos 7 días.
                </div>
            `;
            return;
        }

        const logsHtml = `
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
                    ${logs.map(log => `
                        <tr>
                            <td>${this.formatDate(log.sent_at)}</td>
                            <td>${log.project_id}</td>
                            <td>${log.email_type}</td>
                            <td>${log.to_email}</td>
                            <td>
                                <span class="status-badge status-${log.status === 'sent' ? 'success' : 'error'}">
                                    ${log.status === 'sent' ? '✅ Enviado' : '❌ Error'}
                                </span>
                            </td>
                            <td>${log.appointment_id}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = logsHtml;
    }

    // Enviar recordatorios manualmente
    async sendReminders() {
        if (!confirm('¿Está seguro de que desea enviar los recordatorios ahora?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/emails/reminders/send`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                this.showSuccess(`Recordatorios enviados: ${data.sent} correos, ${data.errors} errores`);
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
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <strong>${type === 'success' ? '✅ Éxito:' : '⚠️ Error:'}</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">×</button>
        `;

        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.dashboard-grid'));

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
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

// Auto-refresh cada 30 segundos
setInterval(() => {
    dashboard.loadStats();
}, 30000);
