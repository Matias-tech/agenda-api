-- Migración para crear servicios de ejemplo vinculados a proyectos API
-- Fecha: 2025-06-05

-- Insertar servicios para el proyecto inmobiliaria
INSERT
    OR
REPLACE INTO
    services (
        id,
        name,
        description,
        duration,
        price,
        api_service,
        category,
        created_at
    )
VALUES (
        'real-estate-1',
        'Visita de Propiedad',
        'Visita guiada para conocer la propiedad disponible',
        60,
        0.00,
        'inmobiliaria',
        'real-estate',
        datetime('now')
    ),
    (
        'real-estate-2',
        'Consulta de Inversión',
        'Asesoría especializada para inversión inmobiliaria',
        90,
        150.00,
        'inmobiliaria',
        'real-estate',
        datetime('now')
    ),
    (
        'real-estate-3',
        'Evaluación de Propiedad',
        'Tasación profesional de inmuebles',
        120,
        200.00,
        'inmobiliaria',
        'real-estate',
        datetime('now')
    );

-- Insertar servicios para el proyecto clínica
INSERT
    OR
REPLACE INTO
    services (
        id,
        name,
        description,
        duration,
        price,
        api_service,
        category,
        created_at
    )
VALUES (
        'medical-1',
        'Consulta General',
        'Consulta médica general con doctor especialista',
        30,
        50.00,
        'clinica',
        'medical',
        datetime('now')
    ),
    (
        'medical-2',
        'Consulta Especializada',
        'Consulta con médico especialista en área específica',
        45,
        80.00,
        'clinica',
        'medical',
        datetime('now')
    ),
    (
        'medical-3',
        'Examen de Rutina',
        'Chequeo médico general preventivo',
        60,
        100.00,
        'clinica',
        'medical',
        datetime('now')
    ),
    (
        'beauty-1',
        'Corte de Cabello',
        'Corte y peinado profesional',
        45,
        25.00,
        'clinica',
        'beauty',
        datetime('now')
    ),
    (
        'beauty-2',
        'Manicure y Pedicure',
        'Tratamiento completo de uñas',
        90,
        40.00,
        'clinica',
        'beauty',
        datetime('now')
    ),
    (
        'beauty-3',
        'Tratamiento Facial',
        'Limpieza y cuidado facial profesional',
        75,
        60.00,
        'clinica',
        'beauty',
        datetime('now')
    );

-- Insertar servicios para el proyecto consultoría
INSERT
    OR
REPLACE INTO
    services (
        id,
        name,
        description,
        duration,
        price,
        api_service,
        category,
        created_at
    )
VALUES (
        'consulting-1',
        'Consultoría de Negocio',
        'Asesoría estratégica para empresas',
        120,
        300.00,
        'consultoria',
        'consulting',
        datetime('now')
    ),
    (
        'consulting-2',
        'Auditoría Financiera',
        'Revisión completa de estados financieros',
        180,
        500.00,
        'consultoria',
        'consulting',
        datetime('now')
    ),
    (
        'consulting-3',
        'Plan de Marketing',
        'Desarrollo de estrategia de marketing digital',
        150,
        400.00,
        'consultoria',
        'consulting',
        datetime('now')
    );

-- Crear algunos registros de disponibilidad de ejemplo vinculados a proyectos
INSERT
    OR
REPLACE INTO
    availability (
        id,
        date,
        start_time,
        end_time,
        is_available,
        api_service,
        user_id,
        created_at
    )
VALUES (
        'avail-1',
        '2025-06-06',
        '08:00',
        '09:00',
        1,
        'inmobiliaria',
        'agent-1',
        datetime('now')
    ),
    (
        'avail-2',
        '2025-06-06',
        '09:00',
        '10:00',
        1,
        'inmobiliaria',
        'agent-1',
        datetime('now')
    ),
    (
        'avail-3',
        '2025-06-06',
        '10:00',
        '11:00',
        1,
        'inmobiliaria',
        'agent-2',
        datetime('now')
    ),
    (
        'avail-4',
        '2025-06-06',
        '08:00',
        '08:30',
        1,
        'clinica',
        'doctor-1',
        datetime('now')
    ),
    (
        'avail-5',
        '2025-06-06',
        '08:30',
        '09:00',
        1,
        'clinica',
        'doctor-1',
        datetime('now')
    ),
    (
        'avail-6',
        '2025-06-06',
        '09:00',
        '09:30',
        1,
        'clinica',
        'doctor-2',
        datetime('now')
    ),
    (
        'avail-7',
        '2025-06-06',
        '14:00',
        '16:00',
        1,
        'consultoria',
        'consultant-1',
        datetime('now')
    ),
    (
        'avail-8',
        '2025-06-06',
        '16:00',
        '18:00',
        1,
        'consultoria',
        'consultant-1',
        datetime('now')
    ),
    -- Disponibilidad para mañana
    (
        'avail-9',
        '2025-06-07',
        '08:00',
        '09:00',
        1,
        'inmobiliaria',
        'agent-1',
        datetime('now')
    ),
    (
        'avail-10',
        '2025-06-07',
        '09:00',
        '10:00',
        1,
        'inmobiliaria',
        'agent-2',
        datetime('now')
    ),
    (
        'avail-11',
        '2025-06-07',
        '08:00',
        '08:30',
        1,
        'clinica',
        'doctor-1',
        datetime('now')
    ),
    (
        'avail-12',
        '2025-06-07',
        '08:30',
        '09:00',
        1,
        'clinica',
        'doctor-2',
        datetime('now')
    ),
    (
        'avail-13',
        '2025-06-07',
        '10:00',
        '12:00',
        1,
        'consultoria',
        'consultant-1',
        datetime('now')
    );