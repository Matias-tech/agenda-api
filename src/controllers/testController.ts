import { Context } from 'hono';

export class TestController {
    async showTestForms(c: Context) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agenda API - Formularios de Prueba</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .forms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .form-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .form-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .form-card h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5rem;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            width: 100%;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .response {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }
        
        .response.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .response.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .services-info {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .services-info h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .service-item {
            padding: 10px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        
        .api-endpoints {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .endpoint {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            font-family: monospace;
        }
        
        .method {
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗓️ Agenda API</h1>
            <p>Formularios de Prueba del Sistema de Citas</p>
        </div>
          <div class="services-info">
            <h3>📋 Servicios Disponibles por Categoría</h3>
            
            <h4 style="color: #667eea; margin-top: 15px;">🏥 Servicios Médicos (medical-clinic)</h4>
            <div class="service-item">
                <strong>medical-1:</strong> Consulta General (30 min - $50.00)
            </div>
            <div class="service-item">
                <strong>medical-2:</strong> Consulta Especializada (45 min - $80.00)
            </div>
            <div class="service-item">
                <strong>medical-3:</strong> Examen de Rutina (60 min - $100.00)
            </div>
            
            <h4 style="color: #667eea; margin-top: 15px;">🏠 Servicios Inmobiliarios (real-estate-agency)</h4>
            <div class="service-item">
                <strong>real-estate-1:</strong> Visita de Propiedad (60 min - Gratis)
            </div>
            <div class="service-item">
                <strong>real-estate-2:</strong> Consulta de Inversión (90 min - $150.00)
            </div>
            <div class="service-item">
                <strong>real-estate-3:</strong> Evaluación de Propiedad (120 min - $200.00)
            </div>
            
            <h4 style="color: #667eea; margin-top: 15px;">💅 Servicios de Belleza (beauty-salon)</h4>
            <div class="service-item">
                <strong>beauty-1:</strong> Corte de Cabello (45 min - $25.00)
            </div>
            <div class="service-item">
                <strong>beauty-2:</strong> Manicure y Pedicure (90 min - $40.00)
            </div>
            <div class="service-item">
                <strong>beauty-3:</strong> Tratamiento Facial (75 min - $60.00)
            </div>
            
            <h4 style="color: #667eea; margin-top: 15px;">💼 Servicios de Consultoría (business-consulting)</h4>
            <div class="service-item">
                <strong>consulting-1:</strong> Consultoría de Negocio (120 min - $300.00)
            </div>
            <div class="service-item">
                <strong>consulting-2:</strong> Auditoría Financiera (180 min - $500.00)
            </div>
        </div>
        
        <div class="forms-grid">
            <!-- Formulario para crear disponibilidad -->
            <div class="form-card">
                <h3>➕ Crear Disponibilidad</h3>                <form id="availabilityForm">
                    <div class="form-group">
                        <label for="avail-api-service">Proyecto/API Service:</label>
                        <select id="avail-api-service" name="api_service" required>
                            <option value="">Seleccionar proyecto...</option>
                            <option value="medical-clinic">Clínica Médica</option>
                            <option value="real-estate-agency">Inmobiliaria</option>
                            <option value="beauty-salon">Salón de Belleza</option>
                            <option value="business-consulting">Consultoría</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="avail-user-id">Responsable (User ID):</label>
                        <select id="avail-user-id" name="user_id" required>
                            <option value="">Seleccionar responsable...</option>
                            <optgroup label="Personal Médico">
                                <option value="doctor-1">Dr. García</option>
                                <option value="doctor-2">Dra. López</option>
                            </optgroup>
                            <optgroup label="Agentes Inmobiliarios">
                                <option value="agent-1">Juan Pérez</option>
                                <option value="agent-2">María Santos</option>
                            </optgroup>
                            <optgroup label="Estilistas">
                                <option value="stylist-1">Ana Rodríguez</option>
                                <option value="stylist-2">Carlos Vega</option>
                            </optgroup>
                            <optgroup label="Consultores">
                                <option value="consultant-1">Roberto Silva</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="avail-date">Fecha:</label>
                        <input type="date" id="avail-date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="avail-start">Hora Inicio:</label>
                        <input type="time" id="avail-start" name="start_time" required>
                    </div>
                    <div class="form-group">
                        <label for="avail-end">Hora Fin:</label>
                        <input type="time" id="avail-end" name="end_time" required>
                    </div>
                    <button type="submit">Crear Disponibilidad</button>
                    <div class="response" id="availabilityResponse"></div>
                </form>
            </div>
              <!-- Formulario para consultar disponibilidad -->
            <div class="form-card">
                <h3>🔍 Consultar Disponibilidad</h3>
                <form id="checkAvailabilityForm">
                    <div class="form-group">
                        <label for="check-date">Fecha:</label>
                        <input type="date" id="check-date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="check-api-service">Proyecto (opcional):</label>
                        <select id="check-api-service" name="api_service">
                            <option value="">Todos los proyectos</option>
                            <option value="medical-clinic">Clínica Médica</option>
                            <option value="real-estate-agency">Inmobiliaria</option>
                            <option value="beauty-salon">Salón de Belleza</option>
                            <option value="business-consulting">Consultoría</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="check-user-id">Responsable (opcional):</label>
                        <select id="check-user-id" name="user_id">
                            <option value="">Todos los responsables</option>
                            <optgroup label="Personal Médico">
                                <option value="doctor-1">Dr. García</option>
                                <option value="doctor-2">Dra. López</option>
                            </optgroup>
                            <optgroup label="Agentes Inmobiliarios">
                                <option value="agent-1">Juan Pérez</option>
                                <option value="agent-2">María Santos</option>
                            </optgroup>
                            <optgroup label="Estilistas">
                                <option value="stylist-1">Ana Rodríguez</option>
                                <option value="stylist-2">Carlos Vega</option>
                            </optgroup>
                            <optgroup label="Consultores">
                                <option value="consultant-1">Roberto Silva</option>
                            </optgroup>
                        </select>
                    </div>
                    <button type="submit">Ver Disponibilidad</button>
                    <div class="response" id="checkAvailabilityResponse"></div>
                </form>
            </div>
            
            <!-- Formulario para crear cita -->
            <div class="form-card">
                <h3>📅 Crear Cita</h3>
                <form id="appointmentForm">
                    <div class="form-group">
                        <label for="user-email">Email del Cliente:</label>
                        <input type="email" id="user-email" name="user_email" required 
                               placeholder="cliente@ejemplo.com">
                    </div>
                    <div class="form-group">
                        <label for="user-name">Nombre del Cliente:</label>
                        <input type="text" id="user-name" name="user_name" required 
                               placeholder="Juan Pérez">
                    </div>
                    <div class="form-group">
                        <label for="user-phone">Teléfono (opcional):</label>
                        <input type="tel" id="user-phone" name="user_phone" 
                               placeholder="+1234567890">
                    </div>                    <div class="form-group">
                        <label for="service-id">Servicio:</label>
                        <select id="service-id" name="service_id" required>
                            <option value="">Seleccionar servicio...</option>
                            <optgroup label="🏥 Servicios Médicos">
                                <option value="medical-1">Consulta General ($50.00)</option>
                                <option value="medical-2">Consulta Especializada ($80.00)</option>
                                <option value="medical-3">Examen de Rutina ($100.00)</option>
                            </optgroup>
                            <optgroup label="🏠 Servicios Inmobiliarios">
                                <option value="real-estate-1">Visita de Propiedad (Gratis)</option>
                                <option value="real-estate-2">Consulta de Inversión ($150.00)</option>
                                <option value="real-estate-3">Evaluación de Propiedad ($200.00)</option>
                            </optgroup>
                            <optgroup label="💅 Servicios de Belleza">
                                <option value="beauty-1">Corte de Cabello ($25.00)</option>
                                <option value="beauty-2">Manicure y Pedicure ($40.00)</option>
                                <option value="beauty-3">Tratamiento Facial ($60.00)</option>
                            </optgroup>
                            <optgroup label="💼 Servicios de Consultoría">
                                <option value="consulting-1">Consultoría de Negocio ($300.00)</option>
                                <option value="consulting-2">Auditoría Financiera ($500.00)</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="appt-date">Fecha:</label>
                        <input type="date" id="appt-date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="appt-start">Hora Inicio:</label>
                        <input type="time" id="appt-start" name="start_time" required>
                    </div>
                    <div class="form-group">
                        <label for="appt-end">Hora Fin:</label>
                        <input type="time" id="appt-end" name="end_time" required>
                    </div>
                    <div class="form-group">
                        <label for="notes">Notas (opcional):</label>
                        <textarea id="notes" name="notes" rows="3" 
                                  placeholder="Información adicional..."></textarea>
                    </div>
                    <button type="submit">Crear Cita</button>
                    <div class="response" id="appointmentResponse"></div>
                </form>
            </div>
              <!-- Formulario para consultar citas -->
            <div class="form-card">
                <h3>📋 Consultar Citas</h3>
                <form id="getAppointmentsForm">
                    <div class="form-group">
                        <label for="search-date">Fecha (opcional):</label>
                        <input type="date" id="search-date" name="date">
                    </div>
                    <div class="form-group">
                        <label for="search-api-service">Proyecto (opcional):</label>
                        <select id="search-api-service" name="api_service">
                            <option value="">Todos los proyectos</option>
                            <option value="medical-clinic">Clínica Médica</option>
                            <option value="real-estate-agency">Inmobiliaria</option>
                            <option value="beauty-salon">Salón de Belleza</option>
                            <option value="business-consulting">Consultoría</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="search-responsible-user-id">Responsable (opcional):</label>
                        <select id="search-responsible-user-id" name="responsible_user_id">
                            <option value="">Todos los responsables</option>
                            <optgroup label="Personal Médico">
                                <option value="doctor-1">Dr. García</option>
                                <option value="doctor-2">Dra. López</option>
                            </optgroup>
                            <optgroup label="Agentes Inmobiliarios">
                                <option value="agent-1">Juan Pérez</option>
                                <option value="agent-2">María Santos</option>
                            </optgroup>
                            <optgroup label="Estilistas">
                                <option value="stylist-1">Ana Rodríguez</option>
                                <option value="stylist-2">Carlos Vega</option>
                            </optgroup>
                            <optgroup label="Consultores">
                                <option value="consultant-1">Roberto Silva</option>
                            </optgroup>
                        </select>
                    </div>
                    <button type="submit">Ver Citas</button>
                    <div class="response" id="getAppointmentsResponse"></div>
                </form>
            </div>
        </div>
          <div class="api-endpoints">
            <h3>🔗 Endpoints de la API</h3>
            <div class="endpoint">
                <span class="method">GET</span> /api/availability?date=YYYY-MM-DD&api_service=PROJECT&user_id=USER_ID
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/availability
            </div>
            <div class="endpoint">
                <span class="method">GET</span> /api/appointments?date=YYYY-MM-DD&api_service=PROJECT&responsible_user_id=USER_ID
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/appointments
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/appointments/:id/confirm
            </div>
            <div class="endpoint">
                <span class="method">POST</span> /api/appointments/:id/cancel
            </div>
        </div>
    </div>
    
    <script>
        // Función para mostrar respuesta
        function showResponse(elementId, data, isError = false) {
            const element = document.getElementById(elementId);
            element.textContent = JSON.stringify(data, null, 2);
            element.className = 'response ' + (isError ? 'error' : 'success');
            element.style.display = 'block';
        }
        
        // Crear disponibilidad
        document.getElementById('availabilityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/availability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                showResponse('availabilityResponse', result, !response.ok);
            } catch (error) {
                showResponse('availabilityResponse', { error: error.message }, true);
            }
        });
          // Consultar disponibilidad
        document.getElementById('checkAvailabilityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // Construir URL con parámetros
            const params = new URLSearchParams();
            Object.keys(data).forEach(key => {
                if (data[key] && data[key] !== '') {
                    params.append(key, data[key]);
                }
            });
            
            try {
                const response = await fetch('/api/availability?' + params.toString());
                const result = await response.json();
                showResponse('checkAvailabilityResponse', result, !response.ok);
            } catch (error) {
                showResponse('checkAvailabilityResponse', { error: error.message }, true);
            }
        });
        
        // Crear cita
        document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // Limpiar campos vacíos
            Object.keys(data).forEach(key => {
                if (data[key] === '') delete data[key];
            });
            
            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                showResponse('appointmentResponse', result, !response.ok);
                
                if (response.ok) {
                    e.target.reset();
                }
            } catch (error) {
                showResponse('appointmentResponse', { error: error.message }, true);
            }
        });
          // Consultar citas
        document.getElementById('getAppointmentsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // Construir URL con parámetros
            const params = new URLSearchParams();
            Object.keys(data).forEach(key => {
                if (data[key] && data[key] !== '') {
                    params.append(key, data[key]);
                }
            });
            
            const url = '/api/appointments' + (params.toString() ? '?' + params.toString() : '');
            
            try {
                const response = await fetch(url);
                const result = await response.json();
                showResponse('getAppointmentsResponse', result, !response.ok);
            } catch (error) {
                showResponse('getAppointmentsResponse', { error: error.message }, true);
            }
        });
        
        // Establecer fecha por defecto a hoy
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('avail-date').value = today;
        document.getElementById('check-date').value = today;
        document.getElementById('appt-date').value = today;
        document.getElementById('search-date').value = today;
    </script>
</body>
</html>    `;

        return c.html(htmlContent);
    }
}
