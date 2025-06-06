-- Crear tablas para el sistema de correos electrónicos
CREATE TABLE IF NOT EXISTS api_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    primary_color TEXT NOT NULL DEFAULT '#007bff',
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    address TEXT,
    resend_api_key TEXT NOT NULL,
    from_email TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    api_project_id TEXT NOT NULL,
    email_type TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (api_project_id, email_type)
);

CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT NOT NULL,
    email TEXT NOT NULL,
    email_type TEXT NOT NULL,
    project_id TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent',
    resend_message_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_logs_appointment ON email_logs (appointment_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_project ON email_logs (project_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_date ON email_logs (sent_at);