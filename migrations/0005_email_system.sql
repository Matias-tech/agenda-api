-- Migración para gestión de correos electrónicos y proyectos API
-- Fecha: 2025-06-05

-- Tabla para configuración de proyectos API
CREATE TABLE IF NOT EXISTS api_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- ej: "inmobiliaria", "clinica"
    brand_name TEXT NOT NULL, -- ej: "InmoSur", "Clínica Dental Sonrisa"
    logo_url TEXT NOT NULL,
    primary_color TEXT NOT NULL DEFAULT '#007bff',
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    address TEXT,
    resend_api_key TEXT NOT NULL,
    from_email TEXT NOT NULL, -- ej: "noreply@inmosur.com"
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para templates de correo personalizados por proyecto
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    api_project_id TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'appointment_confirmation', 'appointment_reminder', etc.
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_project_id) REFERENCES api_projects (id),
    UNIQUE (api_project_id, email_type)
);

-- Tabla para logs de correos enviados
CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT NOT NULL,
    email TEXT NOT NULL,
    email_type TEXT NOT NULL,
    project_id TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
    resend_message_id TEXT, -- ID del mensaje de Resend
    FOREIGN KEY (appointment_id) REFERENCES appointments (id),
    FOREIGN KEY (project_id) REFERENCES api_projects (id)
);

-- Actualizar tabla de servicios para vincular con proyectos
ALTER TABLE services ADD COLUMN api_service TEXT;

-- Actualizar tabla de disponibilidad para vincular con proyectos
ALTER TABLE availability ADD COLUMN api_service TEXT;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_email_logs_appointment ON email_logs (appointment_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_project ON email_logs (project_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_date ON email_logs (sent_at);

CREATE INDEX IF NOT EXISTS idx_services_api_service ON services (api_service);

CREATE INDEX IF NOT EXISTS idx_availability_api_service ON availability (api_service);