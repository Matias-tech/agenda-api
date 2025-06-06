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
  created_at: string; // Fecha de creación del servicio
}

// Representa la disponibilidad para agendar citas
export interface Availability {
  id: string; // Identificador único de la disponibilidad
  date: string; // Fecha de la disponibilidad (YYYY-MM-DD)
  start_time: string; // Hora de inicio (HH:mm)
  end_time: string; // Hora de fin (HH:mm)
  is_available: boolean; // Indica si está disponible
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

// Representa las variables de entorno
export interface Env {
  DB: D1Database; // Instancia de la base de datos
}