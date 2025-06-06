# Sistema de Gestión de Correos Electrónicos 📧

## Descripción General

El sistema de correos electrónicos permite gestionar diferentes proyectos API con sus propias configuraciones de branding y templates de correo personalizados. Cada proyecto puede tener su propia API key de Resend y templates completamente personalizados.

## Características Principales

- ✅ **Multi-proyecto**: Soporte para múltiples proyectos con configuraciones independientes
- ✅ **Templates dinámicos**: HTML y texto plano con variables personalizables
- ✅ **Branding personalizado**: Logo, colores y información de contacto por proyecto
- ✅ **Envío automático**: Correos automáticos para confirmación, cancelación, reagendamiento
- ✅ **Recordatorios programados**: Cron job diario para recordatorios de citas
- ✅ **Logs y estadísticas**: Seguimiento de correos enviados y estadísticas
- ✅ **Preview de templates**: Vista previa de correos con datos de ejemplo

## Configuración Inicial

### 1. Configurar un Proyecto API

```bash
POST /api/emails/projects
```

```json
{
  "id": "inmobiliaria",
  "name": "inmobiliaria", 
  "brand_name": "InmoSur Propiedades",
  "logo_url": "https://example.com/logos/inmosur-logo.png",
  "primary_color": "#e74c3c",
  "contact_email": "contacto@inmosur.com",
  "contact_phone": "+56 9 1234 5678",
  "website_url": "https://inmosur.com",
  "address": "Av. Las Condes 123, Santiago, Chile",
  "resend_api_key": "re_TU_API_KEY_DE_RESEND",
  "from_email": "noreply@inmosur.com"
}
```

### 2. Inicializar Templates Predeterminados

```bash
POST /api/emails/templates/init/inmobiliaria
```

Esto creará automáticamente 5 templates predeterminados:
- `appointment_confirmation` - Confirmación de cita
- `appointment_reminder` - Recordatorio de cita
- `appointment_cancellation` - Cancelación de cita
- `appointment_pending` - Cita pendiente de confirmación
- `appointment_rescheduled` - Reagendamiento de cita

### 3. Vincular Servicios a Proyectos

Al crear servicios, asignar el campo `api_service`:

```json
{
  "name": "Visita a Casa en Las Condes",
  "description": "Visita guiada a propiedad de 3 dormitorios",
  "duration": 60,
  "price": 0,
  "api_service": "inmobiliaria"
}
```

## Tipos de Correos Disponibles

### 1. Confirmación de Cita (`appointment_confirmation`)
Se envía automáticamente cuando se confirma una cita pendiente.

### 2. Cita Pendiente (`appointment_pending`) 
Se envía automáticamente cuando se crea una nueva cita.

### 3. Recordatorio (`appointment_reminder`)
Se envía automáticamente vía cron job a las 6:00 PM para citas del día siguiente.

### 4. Cancelación (`appointment_cancellation`)
Se envía automáticamente cuando se cancela una cita.

### 5. Reagendamiento (`appointment_rescheduled`)
Se envía automáticamente cuando se reagenda una cita.

## Variables Disponibles en Templates

Los templates pueden usar las siguientes variables que se reemplazan automáticamente:

### Variables del Usuario
- `{{user_name}}` - Nombre del usuario
- `{{user_email}}` - Email del usuario
- `{{user_phone}}` - Teléfono del usuario

### Variables de la Cita
- `{{appointment_id}}` - ID único de la cita
- `{{appointment_date}}` - Fecha formateada (ej: "viernes, 6 de junio de 2025")
- `{{appointment_start_time}}` - Hora de inicio (ej: "10:00 AM")
- `{{appointment_end_time}}` - Hora de fin (ej: "11:00 AM")
- `{{appointment_status}}` - Estado de la cita
- `{{appointment_notes}}` - Notas de la cita

### Variables del Servicio
- `{{service_name}}` - Nombre del servicio
- `{{service_description}}` - Descripción del servicio
- `{{service_duration}}` - Duración en minutos
- `{{service_price}}` - Precio formateado

### Variables del Proyecto/Marca
- `{{brand_name}}` - Nombre de la marca
- `{{brand_logo}}` - URL del logo
- `{{brand_color}}` - Color primario
- `{{contact_email}}` - Email de contacto
- `{{contact_phone}}` - Teléfono de contacto
- `{{website_url}}` - URL del sitio web
- `{{business_address}}` - Dirección del negocio

### Variables de Sistema
- `{{current_date}}` - Fecha actual formateada
- `{{current_year}}` - Año actual

## Endpoints de la API

### Gestión de Proyectos

```bash
# Listar proyectos
GET /api/emails/projects

# Crear/actualizar proyecto
POST /api/emails/projects

# Obtener configuración de proyecto
GET /api/emails/projects/{projectId}
```

### Gestión de Templates

```bash
# Listar templates de un proyecto
GET /api/emails/templates/{projectId}

# Inicializar templates predeterminados
POST /api/emails/templates/init/{projectId}

# Ver preview de template
GET /api/emails/templates/preview/{projectId}/{emailType}

# Actualizar template específico
PUT /api/emails/templates/{projectId}/{emailType}

# Crear template personalizado
POST /api/emails/templates
```

### Envío de Correos

```bash
# Enviar correo específico
POST /api/emails/send
{
  "appointment_id": "apt-123",
  "email_type": "appointment_confirmation", 
  "api_service": "inmobiliaria"
}

# Probar envío de correo
POST /api/emails/test
```

### Recordatorios y Estadísticas

```bash
# Enviar recordatorios manualmente
POST /api/emails/reminders/send

# Ver estadísticas de correos
GET /api/emails/stats?days=7

# Ver logs de una cita específica
GET /api/emails/logs/{appointmentId}

# Limpiar logs antiguos
POST /api/emails/cleanup
```

## Cron Jobs Automáticos

El sistema incluye un cron job que se ejecuta diariamente a las 6:00 PM para enviar recordatorios automáticos de citas del día siguiente.

```yaml
# En wrangler.toml
[triggers]
crons = ["0 18 * * *"]
```

## Flujo Automático de Correos

1. **Usuario crea cita** → Correo de "cita pendiente" 📝
2. **Administrador confirma cita** → Correo de "confirmación" ✅
3. **Un día antes a las 6 PM** → Correo de "recordatorio" ⏰
4. **Si se cancela** → Correo de "cancelación" ❌
5. **Si se reagenda** → Correo de "reagendamiento" 📅

## Personalización de Templates

Los templates usan HTML completo con CSS embebido y son completamente personalizables. Ejemplo de personalización:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            font-family: Arial, sans-serif; 
        }
        .header { 
            background: {{brand_color}}; 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="{{brand_logo}}" alt="{{brand_name}}">
            <h1>¡Cita confirmada!</h1>
        </div>
        <div class="content">
            <p>Hola {{user_name}},</p>
            <p>Tu cita para {{service_name}} ha sido confirmada.</p>
            <p><strong>Fecha:</strong> {{appointment_date}}</p>
            <p><strong>Hora:</strong> {{appointment_start_time}}</p>
        </div>
    </div>
</body>
</html>
```

## Seguridad y API Keys

- Las API keys de Resend se almacenan por proyecto en la base de datos
- Cada proyecto tiene su propia configuración independiente
- Los correos se envían desde el dominio configurado para cada proyecto
- Los logs incluyen tracking de éxito/fallo para monitoreo

## Monitoreo y Logs

El sistema mantiene logs detallados de todos los correos enviados:

- ✅ Timestamp de envío
- ✅ Tipo de correo enviado
- ✅ Proyecto asociado
- ✅ Estado del envío (enviado/fallido)
- ✅ ID del mensaje en Resend

Esto permite generar estadísticas y diagnosticar problemas de entrega.

## Ejemplo de Implementación

```javascript
// Confirmar una cita y enviar correo automáticamente
const response = await fetch('/api/appointments/apt-123/confirm', {
  method: 'POST'
});

// El sistema automáticamente:
// 1. Actualiza el estado de la cita a 'confirmed'
// 2. Busca la configuración del proyecto API
// 3. Busca el template de confirmación
// 4. Procesa las variables del template
// 5. Envía el correo vía Resend
// 6. Registra el envío en los logs
```

## Próximas Mejoras

- 📨 Soporte para archivos adjuntos
- 🔔 Notificaciones push adicionales
- 📊 Dashboard de estadísticas avanzadas
- 🎨 Editor visual de templates
- 🌐 Soporte para múltiples idiomas
- 📱 Templates responsivos mejorados

---

Para más información o soporte, contacta al equipo de desarrollo. 🚀
