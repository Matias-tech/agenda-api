-- Tabla de usuarios/clientes
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Identificador único del usuario
    email TEXT UNIQUE NOT NULL, -- Correo electrónico único y obligatorio
    name TEXT NOT NULL, -- Nombre del usuario
    phone TEXT, -- Teléfono del usuario (opcional)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Fecha de última actualización
);

-- Tabla de servicios
CREATE TABLE services (
    id TEXT PRIMARY KEY, -- Identificador único del servicio
    name TEXT NOT NULL, -- Nombre del servicio
    description TEXT, -- Descripción del servicio (opcional)
    duration INTEGER NOT NULL, -- Duración en minutos
    price DECIMAL(10, 2), -- Precio del servicio
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

-- Tabla de disponibilidad
CREATE TABLE availability (
    id TEXT PRIMARY KEY, -- Identificador único de la disponibilidad
    date DATE NOT NULL, -- Fecha de disponibilidad
    start_time TIME NOT NULL, -- Hora de inicio
    end_time TIME NOT NULL, -- Hora de fin
    is_available BOOLEAN DEFAULT TRUE, -- Indica si está disponible
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

-- Tabla de citas
CREATE TABLE appointments (
    id TEXT PRIMARY KEY, -- Identificador único de la cita
    user_id TEXT NOT NULL, -- ID del usuario (cliente)
    service_id TEXT NOT NULL, -- ID del servicio
    date DATE NOT NULL, -- Fecha de la cita
    start_time TIME NOT NULL, -- Hora de inicio de la cita
    end_time TIME NOT NULL, -- Hora de fin de la cita
    status TEXT DEFAULT 'pending', -- Estado de la cita: pendiente, confirmada, cancelada
    notes TEXT, -- Notas adicionales (opcional)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha de última actualización
    FOREIGN KEY (user_id) REFERENCES users (id), -- Relación con usuarios
    FOREIGN KEY (service_id) REFERENCES services (id) -- Relación con servicios
);

-- Índices para mejorar performance

CREATE INDEX idx_appointments_date ON appointments (date);
-- Índice por fecha de cita

CREATE INDEX idx_appointments_user ON appointments (user_id);
-- Índice por usuario

CREATE INDEX idx_availability_date ON availability (date);
-- Índice por fecha de disponibilidad