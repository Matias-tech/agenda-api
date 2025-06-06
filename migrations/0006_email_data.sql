-- Datos de ejemplo para el sistema de correos electrónicos
-- Fecha: 2025-06-05

-- Insertar proyectos API de ejemplo
INSERT
    OR
REPLACE INTO
    api_projects (
        id,
        name,
        brand_name,
        logo_url,
        primary_color,
        contact_email,
        contact_phone,
        website_url,
        address,
        resend_api_key,
        from_email
    )
VALUES (
        'inmobiliaria',
        'inmobiliaria',
        'InmoSur Propiedades',
        'https://example.com/logos/inmosur-logo.png',
        '#e74c3c',
        'contacto@inmosur.com',
        '+56 9 1234 5678',
        'https://inmosur.com',
        'Av. Las Condes 123, Santiago, Chile',
        'YOUR_INMOBILIARIA_RESEND_API_KEY',
        'noreply@inmosur.com'
    ),
    (
        'clinica',
        'clinica',
        'Clínica Dental Sonrisa',
        'https://example.com/logos/clinica-logo.png',
        '#2ecc71',
        'citas@clinicasonrisa.com',
        '+56 9 8765 4321',
        'https://clinicasonrisa.com',
        'Providencia 456, Santiago, Chile',
        'YOUR_CLINICA_RESEND_API_KEY',
        'citas@clinicasonrisa.com'
    ),
    (
        'consultoria',
        'consultoria',
        'Consultoría Empresarial Plus',
        'https://example.com/logos/consultoria-logo.png',
        '#3498db',
        'info@consultoriaplus.com',
        '+56 9 5555 6666',
        'https://consultoriaplus.com',
        'Las Condes 789, Santiago, Chile',
        'YOUR_CONSULTORIA_RESEND_API_KEY',
        'noreply@consultoriaplus.com'
    );

-- Templates para inmobiliaria
INSERT
    OR
REPLACE INTO
    email_templates (
        id,
        api_project_id,
        email_type,
        subject_template,
        html_template,
        text_template
    )
VALUES (
        'inmob_confirmation',
        'inmobiliaria',
        'appointment_confirmation',
        '🏠 Visita confirmada - {{service_name}} | {{brand_name}}',
        '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, {{brand_color}}, #c0392b); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-height: 60px; margin-bottom: 15px; }
        .content { background: white; padding: 30px; }
        .property-card { background: #f8f9fa; border-left: 4px solid {{brand_color}}; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>🏠 ¡Visita confirmada!</h1>
        </div>
        
        <div class="content">
            <p>Estimado/a <strong>{{user_name}}</strong>,</p>
            
            <p>Su visita a la propiedad ha sido <strong>confirmada</strong>. Estos son los detalles:</p>
            
            <div class="property-card">
                <h3>🏡 Detalles de la visita</h3>
                <p><strong>Propiedad:</strong> {{service_name}}</p>
                <p><strong>Fecha:</strong> {{appointment_date}}</p>
                <p><strong>Hora:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
                <p><strong>Código de visita:</strong> {{appointment_id}}</p>
                <p><strong>Notas:</strong> {{appointment_notes}}</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>📞 Su agente inmobiliario</h4>
                <p><strong>Email:</strong> {{contact_email}}</p>
                <p><strong>Teléfono:</strong> {{contact_phone}}</p>
                <p><strong>Oficina:</strong> {{business_address}}</p>
            </div>

            <p><strong>Recomendaciones:</strong></p>
            <ul>
                <li>Llegue 10 minutos antes de la hora programada</li>
                <li>Traiga documento de identidad</li>
                <li>Si tiene preguntas específicas sobre la propiedad, anótelas</li>
            </ul>
            
            <p>¡Esperamos conocerle y mostrarle su futura propiedad!</p>
            
            <p>Cordialmente,<br><strong>{{brand_name}}</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}} | {{contact_email}}</p>
        </div>
    </div>
</body>
</html>',
        'Estimado/a {{user_name}},

Su visita a la propiedad ha sido CONFIRMADA.

DETALLES:
- Propiedad: {{service_name}}
- Fecha: {{appointment_date}}  
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Código: {{appointment_id}}

CONTACTO:
{{contact_email}} | {{contact_phone}}

¡Esperamos conocerle!

{{brand_name}}'
    );

-- Templates para clínica dental
INSERT
    OR
REPLACE INTO
    email_templates (
        id,
        api_project_id,
        email_type,
        subject_template,
        html_template,
        text_template
    )
VALUES (
        'clinic_confirmation',
        'clinica',
        'appointment_confirmation',
        '🦷 Cita dental confirmada - {{service_name}} | {{brand_name}}',
        '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, {{brand_color}}, #27ae60); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-height: 60px; margin-bottom: 15px; }
        .content { background: white; padding: 30px; }
        .appointment-card { background: #f8f9fa; border-left: 4px solid {{brand_color}}; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>🦷 ¡Cita confirmada!</h1>
        </div>
        
        <div class="content">
            <p>Estimado/a <strong>{{user_name}}</strong>,</p>
            
            <p>Su cita dental ha sido <strong>confirmada</strong>. Aquí están los detalles:</p>
            
            <div class="appointment-card">
                <h3>🏥 Detalles de su cita</h3>
                <p><strong>Tratamiento:</strong> {{service_name}}</p>
                <p><strong>Fecha:</strong> {{appointment_date}}</p>
                <p><strong>Hora:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
                <p><strong>Duración:</strong> {{service_duration}} minutos</p>
                <p><strong>Código de cita:</strong> {{appointment_id}}</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>🏥 Información de la clínica</h4>
                <p><strong>Email:</strong> {{contact_email}}</p>
                <p><strong>Teléfono:</strong> {{contact_phone}}</p>
                <p><strong>Dirección:</strong> {{business_address}}</p>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>📋 Preparación para su cita</h4>
                <ul>
                    <li>Llegue 15 minutos antes de su cita</li>
                    <li>Traiga su carnet de identidad y previsión</li>
                    <li>Si toma medicamentos, informe al dentista</li>
                    <li>Evite comer 2 horas antes si requiere anestesia</li>
                </ul>
            </div>

            <p><strong>Observaciones:</strong> {{appointment_notes}}</p>
            
            <p>Si necesita cancelar o reprogramar, hágalo con al menos 24 horas de anticipación.</p>
            
            <p>¡Cuidamos su sonrisa!</p>
            
            <p>Cordialmente,<br><strong>Dr./Dra. y equipo de {{brand_name}}</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}} | {{contact_email}}</p>
        </div>
    </div>
</body>
</html>',
        'Estimado/a {{user_name}},

Su cita dental ha sido CONFIRMADA.

DETALLES:
- Tratamiento: {{service_name}}
- Fecha: {{appointment_date}}
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Código: {{appointment_id}}

PREPARACIÓN:
- Llegue 15 minutos antes
- Traiga carnet y previsión
- Informe medicamentos que toma
- No coma 2h antes si requiere anestesia

CONTACTO:
{{contact_email}} | {{contact_phone}}

¡Cuidamos su sonrisa!

{{brand_name}}'
    );

-- Agregar templates de recordatorio para ambos proyectos
INSERT
    OR
REPLACE INTO
    email_templates (
        id,
        api_project_id,
        email_type,
        subject_template,
        html_template,
        text_template
    )
VALUES (
        'inmob_reminder',
        'inmobiliaria',
        'appointment_reminder',
        '⏰ Recordatorio: Visita mañana - {{service_name}} | {{brand_name}}',
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>.email-container{max-width:600px;margin:0 auto;font-family:Arial,sans-serif}.header{background:linear-gradient(135deg,{{brand_color}},#c0392b);color:white;padding:30px 20px;text-align:center}.content{background:white;padding:30px}.property-card{background:#f8f9fa;border-left:4px solid {{brand_color}};padding:20px;margin:20px 0;border-radius:5px}</style></head><body><div class="email-container"><div class="header"><h1>⏰ Recordatorio de visita</h1></div><div class="content"><p>Estimado/a <strong>{{user_name}}</strong>,</p><p>Le recordamos su visita programada para <strong>mañana</strong>:</p><div class="property-card"><h3>🏡 Su visita de mañana</h3><p><strong>Propiedad:</strong> {{service_name}}</p><p><strong>Fecha:</strong> {{appointment_date}}</p><p><strong>Hora:</strong> {{appointment_start_time}}</p><p><strong>Contacto:</strong> {{contact_phone}}</p></div><p>¡Le esperamos!</p><p>{{brand_name}}</p></div></div></body></html>',
        'Recordatorio: Visita mañana {{appointment_date}} a las {{appointment_start_time}}. Propiedad: {{service_name}}. Contacto: {{contact_phone}}. {{brand_name}}'
    ),
    (
        'clinic_reminder',
        'clinica',
        'appointment_reminder',
        '⏰ Recordatorio: Cita dental mañana - {{service_name}} | {{brand_name}}',
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>.email-container{max-width:600px;margin:0 auto;font-family:Arial,sans-serif}.header{background:linear-gradient(135deg,{{brand_color}},#27ae60);color:white;padding:30px 20px;text-align:center}.content{background:white;padding:30px}.appointment-card{background:#f8f9fa;border-left:4px solid {{brand_color}};padding:20px;margin:20px 0;border-radius:5px}</style></head><body><div class="email-container"><div class="header"><h1>⏰ Recordatorio cita dental</h1></div><div class="content"><p>Estimado/a <strong>{{user_name}}</strong>,</p><p>Le recordamos su cita dental para <strong>mañana</strong>:</p><div class="appointment-card"><h3>🦷 Su cita de mañana</h3><p><strong>Tratamiento:</strong> {{service_name}}</p><p><strong>Fecha:</strong> {{appointment_date}}</p><p><strong>Hora:</strong> {{appointment_start_time}}</p><p><strong>Teléfono:</strong> {{contact_phone}}</p></div><p>Recuerde llegar 15 min antes.</p><p>{{brand_name}}</p></div></div></body></html>',
        'Recordatorio: Cita dental mañana {{appointment_date}} a las {{appointment_start_time}}. Tratamiento: {{service_name}}. Llegue 15 min antes. {{contact_phone}}. {{brand_name}}'
    );