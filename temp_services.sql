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
    ),
    (
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
    ),
    (
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