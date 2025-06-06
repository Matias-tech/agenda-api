-- Insertar servicios iniciales
INSERT INTO
    services (
        id,
        name,
        description,
        duration,
        price,
        created_at
    )
VALUES (
        'service-1',
        'Consulta General',
        'Consulta médica general',
        30,
        50.00,
        datetime('now')
    ),
    (
        'service-2',
        'Consulta Especializada',
        'Consulta con especialista',
        45,
        80.00,
        datetime('now')
    ),
    (
        'service-3',
        'Examen de Rutina',
        'Examen médico de rutina',
        60,
        100.00,
        datetime('now')
    );

-- Insertar disponibilidad de ejemplo para los próximos días
INSERT INTO
    availability (
        id,
        date,
        start_time,
        end_time,
        is_available,
        created_at
    )
VALUES (
        'avail-1',
        '2025-06-06',
        '08:00',
        '09:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-2',
        '2025-06-06',
        '09:00',
        '10:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-3',
        '2025-06-06',
        '10:00',
        '11:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-4',
        '2025-06-06',
        '11:00',
        '12:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-5',
        '2025-06-06',
        '14:00',
        '15:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-6',
        '2025-06-06',
        '15:00',
        '16:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-7',
        '2025-06-07',
        '08:00',
        '09:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-8',
        '2025-06-07',
        '09:00',
        '10:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-9',
        '2025-06-07',
        '10:00',
        '11:00',
        TRUE,
        datetime('now')
    ),
    (
        'avail-10',
        '2025-06-07',
        '11:00',
        '12:00',
        TRUE,
        datetime('now')
    );