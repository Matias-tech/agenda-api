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

-- Insertar proyectos de ejemplo
INSERT INTO api_projects (
    id, name, brand_name, logo_url, primary_color,
    contact_email, contact_phone, website_url, address,
    resend_api_key, from_email, is_active, created_at, updated_at
) VALUES (
    'project-gamma', 'Gamma Project', 'GammaBrand', 'https://example.com/logo_gamma.png', '#00FF00',
    'contact@gamma.com', '555-123-4567', 'https://gamma.com', '456 Gamma Ave, Gammaville',
    'resend_key_gamma_dummy', 'noreply@gamma.com', TRUE, datetime('now'), datetime('now')
);

INSERT INTO api_projects (
    id, name, brand_name, logo_url, primary_color,
    contact_email, contact_phone, website_url, address,
    resend_api_key, from_email, is_active, created_at, updated_at
) VALUES (
    'project-delta', 'Delta Project', 'DeltaBrand', 'https://example.com/logo_delta.png', '#0000FF',
    'contact@delta.com', '555-987-6543', 'https://delta.com', '789 Delta Dr, Deltaville',
    'resend_key_delta_dummy', 'noreply@delta.com', FALSE, datetime('now'), datetime('now')
);
