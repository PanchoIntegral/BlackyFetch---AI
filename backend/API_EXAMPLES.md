# BlackyFetch API - Ejemplos de uso

Este documento contiene ejemplos de requests HTTP para probar la API.

## Variables de entorno

```bash
export API_URL=http://localhost:5000
export USER_ID=<tu-user-id>
export PROJECT_ID=<tu-project-id>
```

## Tickets

### Crear ticket manualmente

```bash
curl -X POST $API_URL/api/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Arreglar el botón de login",
    "description": "El botón de login no responde en Safari",
    "project_id": "'$PROJECT_ID'",
    "created_by": "'$USER_ID'",
    "priority": "high"
  }'
```

### Crear ticket con IA (Copiloto)

```bash
curl -X POST $API_URL/api/tickets/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hay que arreglar el login en mobile, no funciona en Safari",
    "project_id": "'$PROJECT_ID'",
    "created_by": "'$USER_ID'",
    "context": {
      "source": "slack",
      "channel": "#desarrollo"
    }
  }'
```

### Obtener tickets de un proyecto

```bash
curl $API_URL/api/tickets/project/$PROJECT_ID
```

### Obtener un ticket específico

```bash
curl $API_URL/api/tickets/<ticket-id>
```

### Mover ticket (cambiar estado)

```bash
curl -X PATCH $API_URL/api/tickets/<ticket-id>/move \
  -H "Content-Type: application/json" \
  -d '{
    "new_status": "in_progress",
    "user_id": "'$USER_ID'"
  }'
```

Estados válidos:
- `backlog`
- `todo`
- `in_progress`
- `in_review`
- `done`
- `archived`

### Asignar ticket

```bash
curl -X PATCH $API_URL/api/tickets/<ticket-id>/assign \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_to": "'$USER_ID'",
    "assigned_by": "'$USER_ID'"
  }'
```

## Webhooks

### GitHub Webhook (Git-Sync)

Configurar en GitHub:
1. Ir a Settings > Webhooks
2. Payload URL: `http://tu-servidor.com/api/webhooks/github`
3. Content type: `application/json`
4. Secret: (tu GITHUB_WEBHOOK_SECRET)
5. Events: `push`, `pull_request`

El sistema automáticamente:
- Detectará commits en ramas asociadas a tickets
- Moverá tickets a "In Progress" al hacer push
- Registrará la actividad de Git en el ticket

### Slack Webhook

TODO: Documentar integración con Slack

## WebSocket (Real-time)

Conectar con SocketIO desde el frontend:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Suscribirse a un proyecto
socket.emit('subscribe_project', { project_id: 'abc123' });

// Escuchar creación de tickets
socket.on('notification', (data) => {
  console.log('Nueva notificación:', data);
});

// Escuchar movimientos de tickets
socket.on('ticket:moved', (data) => {
  console.log('Ticket movido:', data);
});
```

## Health Checks

```bash
# Status general
curl $API_URL/health

# Status del servicio de tickets
curl $API_URL/api/tickets/health

# Status del servicio de webhooks
curl $API_URL/api/webhooks/health
```

## Formato de respuestas

### Success (Ticket creado)

```json
{
  "id": "abc-123",
  "title": "Arreglar login",
  "description": "...",
  "status": "backlog",
  "priority": "high",
  "created_by": "user-id",
  "project_id": "project-id",
  "tags": ["bug", "frontend"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Error

```json
{
  "error": "Missing field: title"
}
```

## Notas de desarrollo

- En modo desarrollo (DEBUG=True), se usa MockAIAdapter (no requiere OpenAI API key)
- Los webhooks de GitHub requieren HTTPS en producción
- SocketIO funciona sobre WebSocket o long-polling automáticamente
