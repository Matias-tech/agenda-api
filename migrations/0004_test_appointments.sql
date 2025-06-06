-- Insertar usuarios de prueba
INSERT
    OR IGNORE INTO users (
        id,
        email,
        name,
        phone,
        created_at,
        updated_at
    )
VALUES (
        'user-1',
        'juan.perez@email.com',
        'Juan Pérez',
        '+123456789',
        datetime('now'),
        datetime('now')
    ),
    (
        'user-2',
        'maria.garcia@email.com',
        'María García',
        '+987654321',
        datetime('now'),
        datetime('now')
    ),
    (
        'user-3',
        'carlos.lopez@email.com',
        'Carlos López',
        '+456789123',
        datetime('now'),
        datetime('now')
    );

-- Insertar citas de prueba
INSERT
    OR IGNORE INTO appointments (
        id,
        user_id,
        service_id,
        date,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at
    )
VALUES
    -- Citas médicas
    (
        'appt-1',
        'user-1',
        'medical-1',
        '2025-06-06',
        '08:00',
        '08:30',
        'confirmed',
        'Chequeo general',
        datetime('now'),
        datetime('now')
    ),
    (
        'appt-2',
        'user-2',
        'medical-2',
        '2025-06-06',
        '10:00',
        '10:45',
        'pending',
        'Consulta especializada',
        datetime('now'),
        datetime('now')
    ),

-- Citas inmobiliarias
(
    'appt-3',
    'user-3',
    'real-estate-1',
    '2025-06-06',
    '11:00',
    '12:00',
    'confirmed',
    'Visita casa en venta',
    datetime('now'),
    datetime('now')
),

-- Citas de belleza
(
    'appt-4',
    'user-1',
    'beauty-1',
    '2025-06-07',
    '09:00',
    '09:45',
    'pending',
    'Corte de cabello',
    datetime('now'),
    datetime('now')
),

-- Citas de consultoría
(
    'appt-5',
    'user-2',
    'consulting-1',
    '2025-06-08',
    '10:00',
    '12:00',
    'confirmed',
    'Revisión estrategia de negocio',
    datetime('now'),
    datetime('now')
);