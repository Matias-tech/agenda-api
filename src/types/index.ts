// Representa un usuario del sistema
export interface User {
  id: string; // Identificador único del usuario
  email: string; // Correo electrónico del usuario
  name: string; // Nombre del usuario
  phone?: string; // Teléfono del usuario (opcional)
  created_at: string; // Fecha de creación del usuario
  updated_at: string; // Fecha de última actualización del usuario
}

// Representa un servicio disponible
export interface Service {
  id: string; // Identificador único del servicio
  name: string; // Nombre del servicio
  description?: string; // Descripción del servicio (opcional)
  duration: number; // Duración en minutos
  price?: number; // Precio del servicio (opcional)
  api_service?: string; // ID del proyecto/servicio API
  category?: string; // Categoría del servicio (médico, inmobiliario, etc.)
  created_at: string; // Fecha de creación del servicio
}

// Representa la disponibilidad para agendar citas
export interface Availability {
  id: string; // Identificador único de la disponibilidad
  date: string; // Fecha de la disponibilidad (YYYY-MM-DD)
  start_time: string; // Hora de inicio (HH:mm)
  end_time: string; // Hora de fin (HH:mm)
  is_available: boolean; // Indica si está disponible
  api_service?: string; // ID del proyecto/servicio API
  user_id?: string; // ID del responsable de la disponibilidad
  created_at: string; // Fecha de creación del registro
}

// Representa una cita agendada
export interface Appointment {
  id: string; // Identificador único de la cita
  user_id: string; // ID del usuario que agenda la cita
  service_id: string; // ID del servicio solicitado
  date: string; // Fecha de la cita (YYYY-MM-DD)
  start_time: string; // Hora de inicio (HH:mm)
  end_time: string; // Hora de fin (HH:mm)
  status: 'pending' | 'confirmed' | 'cancelled'; // Estado de la cita
  notes?: string; // Notas adicionales (opcional)
  created_at: string; // Fecha de creación de la cita
  updated_at: string; // Fecha de última actualización de la cita
}

// Representa la configuración de un proyecto/servicio API
export interface ApiProject {
  id: string; // Identificador del proyecto
  name: string; // Nombre del proyecto (ej: "inmobiliaria", "clinica")
  brand_name: string; // Nombre de la marca
  logo_url: string; // URL del logo
  primary_color: string; // Color primario del branding
  contact_email: string; // Email de contacto
  contact_phone?: string; // Teléfono de contacto
  website_url?: string; // URL del sitio web
  address?: string; // Dirección física
  resend_api_key: string; // API Key de Resend para este proyecto
  from_email: string; // Email desde el cual se envían los correos
  created_at: string;
}

// Representa los tipos de correos disponibles
export type EmailType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancellation'
  | 'appointment_rescheduled'
  | 'appointment_pending'
  | 'availability_notification';

// Representa los datos del template de correo
export interface EmailTemplate {
  id: string;
  api_project_id: string; // Vinculado al proyecto
  email_type: EmailType;
  subject_template: string; // Template del asunto con variables
  html_template: string; // Template HTML con variables
  text_template?: string; // Template de texto plano
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Representa los datos para enviar un correo
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  project_config: ApiProject;
}

// Representa las variables de entorno
export interface Env {
  DB: D1Database; // Instancia de la base de datos
  // Las API keys de Resend se almacenarán en la base de datos por proyecto
}