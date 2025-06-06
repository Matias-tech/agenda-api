// Templates HTML para diferentes tipos de correos electrónicos

export const emailTemplates = {
    // Template base con estilos comunes
    baseStyles: `
    <style>
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .header {
        background: linear-gradient(135deg, {{brand_color}}, #667eea);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .logo {
        max-height: 60px;
        margin-bottom: 15px;
      }
      .content {
        background: white;
        padding: 30px;
        border-left: 1px solid #e0e0e0;
        border-right: 1px solid #e0e0e0;
      }
      .appointment-card {
        background: #f8f9fa;
        border-left: 4px solid {{brand_color}};
        padding: 20px;
        margin: 20px 0;
        border-radius: 5px;
      }
      .button {
        display: inline-block;
        background: {{brand_color}};
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 5px;
        margin: 15px 0;
        text-align: center;
      }
      .footer {
        background: #f1f1f1;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
        border-radius: 0 0 10px 10px;
        border-left: 1px solid #e0e0e0;
        border-right: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;
      }
      .status-confirmed { color: #28a745; font-weight: bold; }
      .status-pending { color: #ffc107; font-weight: bold; }
      .status-cancelled { color: #dc3545; font-weight: bold; }
    </style>
  `,

    // Template de confirmación de cita
    confirmation: {
        subject: '✅ Cita confirmada - {{service_name}} | {{brand_name}}',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Confirmada</title>
        {{BASE_STYLES}}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>¡Tu cita ha sido confirmada!</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>{{user_name}}</strong>,</p>
            
            <p>Nos complace confirmar tu cita. Aquí tienes todos los detalles:</p>
            
            <div class="appointment-card">
              <h3>📅 Detalles de tu cita</h3>
              <p><strong>Servicio:</strong> {{service_name}}</p>
              <p><strong>Fecha:</strong> {{appointment_date}}</p>
              <p><strong>Hora:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
              <p><strong>Duración:</strong> {{service_duration}} minutos</p>
              <p><strong>Estado:</strong> <span class="status-confirmed">Confirmada</span></p>
              <p><strong>Código de cita:</strong> {{appointment_id}}</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 Información de contacto</h4>
              <p><strong>Email:</strong> {{contact_email}}</p>
              <p><strong>Teléfono:</strong> {{contact_phone}}</p>
              <p><strong>Dirección:</strong> {{business_address}}</p>
            </div>

            <p><strong>Notas:</strong> {{appointment_notes}}</p>
            
            <p>Si necesitas hacer algún cambio o tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <p>¡Esperamos verte pronto!</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de {{brand_name}}</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hola {{user_name}},

¡Tu cita ha sido confirmada!

DETALLES DE LA CITA:
- Servicio: {{service_name}}
- Fecha: {{appointment_date}}
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Duración: {{service_duration}} minutos
- Estado: Confirmada
- Código: {{appointment_id}}

CONTACTO:
- Email: {{contact_email}}
- Teléfono: {{contact_phone}}
- Dirección: {{business_address}}

Notas: {{appointment_notes}}

Si necesitas hacer cambios, contáctanos.

Saludos,
Equipo de {{brand_name}}
{{website_url}}
    `
    },

    // Template de recordatorio de cita
    reminder: {
        subject: '⏰ Recordatorio: Tu cita es mañana - {{service_name}} | {{brand_name}}',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Cita</title>
        {{BASE_STYLES}}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>⏰ Recordatorio de cita</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>{{user_name}}</strong>,</p>
            
            <p>Este es un amable recordatorio de tu cita programada para mañana:</p>
            
            <div class="appointment-card">
              <h3>📅 Tu cita de mañana</h3>
              <p><strong>Servicio:</strong> {{service_name}}</p>
              <p><strong>Fecha:</strong> {{appointment_date}}</p>
              <p><strong>Hora:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
              <p><strong>Duración:</strong> {{service_duration}} minutos</p>
              <p><strong>Código:</strong> {{appointment_id}}</p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>💡 Recomendaciones:</h4>
              <ul>
                <li>Llega 10 minutos antes de tu cita</li>
                <li>Trae un documento de identificación</li>
                <li>Si no puedes asistir, cancela con al menos 24 horas de anticipación</li>
              </ul>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 Información de contacto</h4>
              <p><strong>Email:</strong> {{contact_email}}</p>
              <p><strong>Teléfono:</strong> {{contact_phone}}</p>
              <p><strong>Dirección:</strong> {{business_address}}</p>
            </div>
            
            <p>Si tienes alguna pregunta o necesitas reagendar, contáctanos lo antes posible.</p>
            
            <p>¡Te esperamos!</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de {{brand_name}}</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hola {{user_name}},

RECORDATORIO: Tu cita es mañana

DETALLES:
- Servicio: {{service_name}}
- Fecha: {{appointment_date}}
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Código: {{appointment_id}}

RECOMENDACIONES:
- Llega 10 minutos antes
- Trae identificación
- Si no puedes asistir, cancela con 24h de anticipación

CONTACTO:
Email: {{contact_email}}
Teléfono: {{contact_phone}}
Dirección: {{business_address}}

¡Te esperamos!

Equipo de {{brand_name}}
{{website_url}}
    `
    },

    // Template de cancelación
    cancellation: {
        subject: '❌ Cita cancelada - {{service_name}} | {{brand_name}}',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Cancelada</title>
        {{BASE_STYLES}}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>Cita cancelada</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>{{user_name}}</strong>,</p>
            
            <p>Te confirmamos que tu cita ha sido <strong>cancelada</strong> exitosamente.</p>
            
            <div class="appointment-card">
              <h3>📅 Cita cancelada</h3>
              <p><strong>Servicio:</strong> {{service_name}}</p>
              <p><strong>Fecha:</strong> {{appointment_date}}</p>
              <p><strong>Hora:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
              <p><strong>Estado:</strong> <span class="status-cancelled">Cancelada</span></p>
              <p><strong>Código:</strong> {{appointment_id}}</p>
            </div>

            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>ℹ️ Información importante:</h4>
              <p>Si realizaste algún pago, será procesado el reembolso según nuestras políticas.</p>
              <p>Puedes agendar una nueva cita cuando gustes a través de nuestros canales de contacto.</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 ¿Necesitas una nueva cita?</h4>
              <p><strong>Email:</strong> {{contact_email}}</p>
              <p><strong>Teléfono:</strong> {{contact_phone}}</p>
              <p><strong>Sitio web:</strong> {{website_url}}</p>
            </div>
            
            <p>Lamentamos cualquier inconveniente y esperamos poder atenderte en el futuro.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de {{brand_name}}</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hola {{user_name}},

Tu cita ha sido CANCELADA exitosamente.

DETALLES DE LA CITA CANCELADA:
- Servicio: {{service_name}}
- Fecha: {{appointment_date}}
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Código: {{appointment_id}}

Si realizaste algún pago, será procesado el reembolso.
Puedes agendar una nueva cita cuando gustes.

CONTACTO PARA NUEVA CITA:
Email: {{contact_email}}
Teléfono: {{contact_phone}}
Web: {{website_url}}

Esperamos poder atenderte en el futuro.

Equipo de {{brand_name}}
    `
    },

    // Template de cita pendiente de confirmación
    pending: {
        subject: '⏳ Cita pendiente de confirmación - {{service_name}} | {{brand_name}}',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Pendiente</title>
        {{BASE_STYLES}}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>Cita pendiente de confirmación</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>{{user_name}}</strong>,</p>
            
            <p>Hemos recibido tu solicitud de cita. Está <strong>pendiente de confirmación</strong> por parte de nuestro equipo.</p>
            
            <div class="appointment-card">
              <h3>📅 Detalles de tu solicitud</h3>
              <p><strong>Servicio:</strong> {{service_name}}</p>
              <p><strong>Fecha solicitada:</strong> {{appointment_date}}</p>
              <p><strong>Hora solicitada:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
              <p><strong>Duración:</strong> {{service_duration}} minutos</p>
              <p><strong>Estado:</strong> <span class="status-pending">Pendiente de confirmación</span></p>
              <p><strong>Código:</strong> {{appointment_id}}</p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>⏰ ¿Qué sigue?</h4>
              <p>Nuestro equipo revisará tu solicitud y te contactaremos dentro de las próximas <strong>24 horas</strong> para confirmar la disponibilidad.</p>
              <p>Recibirás un correo de confirmación una vez que tu cita sea aprobada.</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 Información de contacto</h4>
              <p><strong>Email:</strong> {{contact_email}}</p>
              <p><strong>Teléfono:</strong> {{contact_phone}}</p>
              <p><strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
            </div>

            <p><strong>Notas adicionales:</strong> {{appointment_notes}}</p>
            
            <p>Si tienes alguna pregunta urgente, no dudes en contactarnos directamente.</p>
            
            <p>Gracias por elegirnos.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de {{brand_name}}</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hola {{user_name}},

Tu solicitud de cita está PENDIENTE DE CONFIRMACIÓN.

DETALLES DE TU SOLICITUD:
- Servicio: {{service_name}}
- Fecha: {{appointment_date}}
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Código: {{appointment_id}}

QUÉ SIGUE:
Te contactaremos en las próximas 24 horas para confirmar disponibilidad.

CONTACTO:
Email: {{contact_email}}
Teléfono: {{contact_phone}}
Horario: Lunes a Viernes, 9:00 AM - 6:00 PM

Notas: {{appointment_notes}}

Gracias por elegirnos.

Equipo de {{brand_name}}
{{website_url}}
    `
    },

    // Template de reagendamiento
    rescheduled: {
        subject: '📅 Cita reagendada - {{service_name}} | {{brand_name}}',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Reagendada</title>
        {{BASE_STYLES}}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}" class="logo">
            <h1>Tu cita ha sido reagendada</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>{{user_name}}</strong>,</p>
            
            <p>Te confirmamos que tu cita ha sido <strong>reagendada exitosamente</strong>.</p>
            
            <div class="appointment-card">
              <h3>📅 Nueva fecha y hora</h3>
              <p><strong>Servicio:</strong> {{service_name}}</p>
              <p><strong>Nueva fecha:</strong> {{appointment_date}}</p>
              <p><strong>Nueva hora:</strong> {{appointment_start_time}} - {{appointment_end_time}}</p>
              <p><strong>Duración:</strong> {{service_duration}} minutos</p>
              <p><strong>Estado:</strong> <span class="status-confirmed">Confirmada</span></p>
              <p><strong>Código:</strong> {{appointment_id}}</p>
            </div>

            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>✅ Cambio confirmado</h4>
              <p>Tu cita anterior ha sido cancelada automáticamente y esta nueva fecha está confirmada.</p>
              <p>Te enviaremos un recordatorio un día antes de tu nueva cita.</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>📍 Información de contacto</h4>
              <p><strong>Email:</strong> {{contact_email}}</p>
              <p><strong>Teléfono:</strong> {{contact_phone}}</p>
              <p><strong>Dirección:</strong> {{business_address}}</p>
            </div>

            <p><strong>Notas:</strong> {{appointment_notes}}</p>
            
            <p>Si necesitas hacer otro cambio, contáctanos con al menos 24 horas de anticipación.</p>
            
            <p>¡Esperamos verte en tu nueva fecha!</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo de {{brand_name}}</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; {{current_year}} {{brand_name}}. Todos los derechos reservados.</p>
            <p>{{website_url}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
Hola {{user_name}},

Tu cita ha sido REAGENDADA exitosamente.

NUEVA FECHA Y HORA:
- Servicio: {{service_name}}
- Fecha: {{appointment_date}}
- Hora: {{appointment_start_time}} - {{appointment_end_time}}
- Código: {{appointment_id}}

Tu cita anterior fue cancelada y esta nueva fecha está confirmada.

CONTACTO:
Email: {{contact_email}}
Teléfono: {{contact_phone}}
Dirección: {{business_address}}

Notas: {{appointment_notes}}

¡Esperamos verte en tu nueva fecha!

Equipo de {{brand_name}}
{{website_url}}
    `
    }
}

// Función para procesar el template y reemplazar BASE_STYLES
export function processEmailTemplate(template: string, brandColor: string): string {
    const baseStyles = emailTemplates.baseStyles.replace(/{{brand_color}}/g, brandColor)
    return template.replace('{{BASE_STYLES}}', baseStyles)
}
