-- Migración para mejorar el sistema y hacerlo más flexible
-- Agregar campos para multi-proyecto y responsables

-- Agregar campos a la tabla de disponibilidad
ALTER TABLE availability ADD COLUMN api_service TEXT; -- ID del proyecto/servicio API
ALTER TABLE availability ADD COLUMN user_id TEXT; -- ID del responsable de la disponibilidad

-- Agregar campo a la tabla de servicios para categorización
ALTER TABLE services ADD COLUMN api_service TEXT; -- ID del proyecto/servicio API
ALTER TABLE services ADD COLUMN category TEXT; -- Categoría del servicio (médico, inmobiliario, etc.)

-- Crear índices para mejorar performance
CREATE INDEX idx_availability_api_service ON availability (api_service);
CREATE INDEX idx_availability_user_id ON availability (user_id);
CREATE INDEX idx_services_api_service ON services (api_service);
CREATE INDEX idx_services_category ON services (category);

-- Insertar servicios de ejemplo para diferentes tipos de negocio
INSERT INTO services (id, name, description, duration, price, api_service, category, created_at) VALUES
-- Servicios médicos
('medical-1', 'Consulta General', 'Consulta médica general', 30, 50.00, 'medical-clinic', 'médico', datetime('now')),
('medical-2', 'Consulta Especializada', 'Consulta con especialista', 45, 80.00, 'medical-clinic', 'médico', datetime('now')),
('medical-3', 'Examen de Rutina', 'Examen médico de rutina', 60, 100.00, 'medical-clinic', 'médico', datetime('now')),

-- Servicios inmobiliarios
('real-estate-1', 'Visita de Propiedad', 'Visita guiada a propiedad', 60, 0.00, 'real-estate-agency', 'inmobiliario', datetime('now')),
('real-estate-2', 'Consulta de Inversión', 'Asesoría para inversión inmobiliaria', 90, 150.00, 'real-estate-agency', 'inmobiliario', datetime('now')),
('real-estate-3', 'Evaluación de Propiedad', 'Evaluación profesional de inmueble', 120, 200.00, 'real-estate-agency', 'inmobiliario', datetime('now')),

-- Servicios de belleza
('beauty-1', 'Corte de Cabello', 'Corte y peinado profesional', 45, 25.00, 'beauty-salon', 'belleza', datetime('now')),
('beauty-2', 'Manicure y Pedicure', 'Tratamiento completo de uñas', 90, 40.00, 'beauty-salon', 'belleza', datetime('now')),
('beauty-3', 'Tratamiento Facial', 'Limpieza y tratamiento facial', 75, 60.00, 'beauty-salon', 'belleza', datetime('now')),

-- Servicios de consultoría
('consulting-1', 'Consultoría de Negocio', 'Asesoría empresarial estratégica', 120, 300.00, 'business-consulting', 'consultoría', datetime('now')),
('consulting-2', 'Auditoría Financiera', 'Revisión de procesos financieros', 180, 500.00, 'business-consulting', 'consultoría', datetime('now'));

-- Insertar disponibilidad de ejemplo con los nuevos campos
INSERT INTO availability (id, date, start_time, end_time, is_available, api_service, user_id, created_at) VALUES
-- Disponibilidad médica
('avail-med-1', '2025-06-06', '08:00', '09:00', TRUE, 'medical-clinic', 'doctor-1', datetime('now')),
('avail-med-2', '2025-06-06', '09:00', '10:00', TRUE, 'medical-clinic', 'doctor-1', datetime('now')),
('avail-med-3', '2025-06-06', '10:00', '11:00', TRUE, 'medical-clinic', 'doctor-2', datetime('now')),
('avail-med-4', '2025-06-06', '14:00', '15:00', TRUE, 'medical-clinic', 'doctor-1', datetime('now')),

-- Disponibilidad inmobiliaria
('avail-re-1', '2025-06-06', '09:00', '10:00', TRUE, 'real-estate-agency', 'agent-1', datetime('now')),
('avail-re-2', '2025-06-06', '11:00', '12:00', TRUE, 'real-estate-agency', 'agent-1', datetime('now')),
('avail-re-3', '2025-06-06', '16:00', '17:00', TRUE, 'real-estate-agency', 'agent-2', datetime('now')),

-- Disponibilidad de belleza
('avail-beauty-1', '2025-06-07', '09:00', '10:00', TRUE, 'beauty-salon', 'stylist-1', datetime('now')),
('avail-beauty-2', '2025-06-07', '10:30', '11:30', TRUE, 'beauty-salon', 'stylist-1', datetime('now')),
('avail-beauty-3', '2025-06-07', '14:00', '15:00', TRUE, 'beauty-salon', 'stylist-2', datetime('now')),

-- Disponibilidad de consultoría
('avail-cons-1', '2025-06-08', '10:00', '12:00', TRUE, 'business-consulting', 'consultant-1', datetime('now')),
('avail-cons-2', '2025-06-08', '14:00', '17:00', TRUE, 'business-consulting', 'consultant-1', datetime('now'));
