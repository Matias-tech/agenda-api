# API de Agenda - Guía de Uso

## Endpoints Disponibles

### 1. Página Principal
```
GET http://127.0.0.1:8787/
```

### 2. Servicios Disponibles
Para ver los servicios disponibles, puedes consultar directamente la base de datos con:
```bash
wrangler d1 execute DB --local --command="SELECT * FROM services;"
```

### 3. Disponibilidad

#### Obtener disponibilidad por fecha
```bash
curl "http://127.0.0.1:8787/api/availability?date=2025-06-06"
```

#### Crear nueva disponibilidad
```bash
curl -X POST "http://127.0.0.1:8787/api/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-06-08",
    "start_time": "09:00",
    "end_time": "10:00",
    "is_available": true
  }'
```

### 4. Citas

#### Crear una nueva cita
```bash
curl -X POST "http://127.0.0.1:8787/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "juan@ejemplo.com",
    "user_name": "Juan Pérez",
    "user_phone": "+1234567890",
    "service_id": "service-1",
    "date": "2025-06-06",
    "start_time": "08:00",
    "end_time": "08:30",
    "notes": "Primera consulta"
  }'
```

#### Obtener citas por fecha
```bash
curl "http://127.0.0.1:8787/api/appointments?date=2025-06-06"
```

#### Confirmar una cita
```bash
curl -X POST "http://127.0.0.1:8787/api/appointments/{appointment_id}/confirm"
```

#### Cancelar una cita
```bash
curl -X POST "http://127.0.0.1:8787/api/appointments/{appointment_id}/cancel"
```

## Comandos de Base de Datos (Desarrollo)

### Ver todas las tablas
```bash
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Ver servicios
```bash
wrangler d1 execute DB --local --command="SELECT * FROM services;"
```

### Ver disponibilidad
```bash
wrangler d1 execute DB --local --command="SELECT * FROM availability ORDER BY date, start_time;"
```

### Ver citas
```bash
wrangler d1 execute DB --local --command="SELECT * FROM appointments;"
```

### Ver usuarios
```bash
wrangler d1 execute DB --local --command="SELECT * FROM users;"
```

## Despliegue a Producción

### Aplicar migraciones a producción
```bash
wrangler d1 migrations apply DB --remote
```

### Desplegar el Worker
```bash
wrangler deploy
```

## Notas Importantes

1. **Desarrollo**: La base de datos local se encuentra en `.wrangler/state/v3/d1/`
2. **Autenticación**: Actualmente deshabilitada para desarrollo
3. **Validación**: Incluye validación de emails y formatos de fecha/hora
4. **IDs únicos**: Se generan automáticamente usando crypto.randomUUID()
5. **Estado de citas**: pending, confirmed, cancelled
