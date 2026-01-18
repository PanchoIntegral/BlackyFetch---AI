# 🏗️ BlackyFetch - Arquitectura Técnica

## Diagrama de Arquitectura Hexagonal

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL WORLD                               │
│  (GitHub, Slack, Teams, OpenAI, PostgreSQL, Redis, Browser)        │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ Webhooks, API Calls, HTTP
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      WEB ADAPTERS                            │  │
│  │  • tickets_controller.py  (REST API Endpoints)              │  │
│  │  • webhooks_controller.py (GitHub, Slack, Teams)            │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                            │
│  ┌──────────────────────▼───────────────────────────────────────┐  │
│  │                    ADAPTERS (Ports Implementation)           │  │
│  │  • database.py        → ITicketRepository, IUserRepository  │  │
│  │  • openai_adapter.py  → IAIService                          │  │
│  │  • socketio_adapter.py → IEventBus, INotificationService    │  │
│  │  • git_adapter.py     → IGitService                         │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ Dependency Injection
                          │
┌─────────────────────────▼────────────────────────────────────────────┐
│                     APPLICATION LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   USE CASES (Business Logic)                 │  │
│  │  • ticket_service.py                                        │  │
│  │    - create_ticket()                                        │  │
│  │    - create_ticket_from_natural_language() [Copiloto]      │  │
│  │    - move_ticket()                                          │  │
│  │    - process_git_push() [Git-Sync]                         │  │
│  │                                                              │  │
│  │  • ai_service.py                                            │  │
│  │    - create_ticket_from_message()                           │  │
│  │    - enrich_ticket()                                        │  │
│  │    - analyze_message_urgency()                              │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ Uses
                          │
┌─────────────────────────▼────────────────────────────────────────────┐
│                       DOMAIN LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    ENTITIES (Pure Business)                  │  │
│  │  • Ticket    (status, priority, git_activity)               │  │
│  │  • User      (role, can_edit_ticket() [Smart Permissions])  │  │
│  │  • Project   (auto_move_enabled, ai_assistant_enabled)      │  │
│  │  • Comment                                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PORTS (Interfaces)                        │  │
│  │  • ITicketRepository   • IAIService                         │  │
│  │  • IUserRepository     • IEventBus                          │  │
│  │  • IProjectRepository  • IGitService                        │  │
│  │  • INotificationService                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos: Creación de Ticket con IA

```
1. Usuario envía mensaje natural
   │
   ├─→ POST /api/tickets/ai
   │   { "message": "Arreglar login en mobile" }
   │
2. tickets_controller.py (Web Layer)
   │
   ├─→ ticket_service.create_ticket_from_natural_language()
   │
3. Application Layer
   │
   ├─→ ai_service.parse_natural_language_to_ticket()
   │   │
   │   └─→ OpenAI API (Infrastructure)
   │       "Título: Corregir error de autenticación en mobile..."
   │
4. ticket_service.py
   │
   ├─→ ticket_repo.create(ticket) → PostgreSQL
   │
   ├─→ event_bus.publish("ticket.created.ai", {...})
   │
   └─→ notification_service.notify_ticket_created(ticket)
       │
       └─→ SocketIO emite evento al frontend
           │
           └─→ Frontend actualiza tablero automáticamente ✨
```

## Flujo: Git-Sync (Movimiento Automático)

```
1. Developer hace push a rama feature/BF-123-login-fix
   │
   ├─→ GitHub Webhook → POST /api/webhooks/github
   │
2. webhooks_controller.handle_github_push()
   │
   ├─→ ticket_service.process_git_push(
   │       branch="feature/BF-123-login-fix",
   │       commit="abc123",
   │       author="developer_gh"
   │   )
   │
3. Application Layer
   │
   ├─→ ticket_repo.find_by_git_branch("feature/BF-123-login-fix")
   │   └─→ Encuentra ticket BF-123
   │
   ├─→ ticket.add_git_activity(branch, author, commit)
   │   └─→ Registra que "developer_gh" trabajó en esto
   │       → Smart Permissions: developer_gh puede editar el ticket
   │
   ├─→ ticket.move_to(TicketStatus.IN_PROGRESS)
   │   └─→ Movimiento automático basado en actividad
   │
   ├─→ ticket_repo.update(ticket) → PostgreSQL
   │
   └─→ event_bus.publish("ticket.moved.auto", {...})
       │
       └─→ SocketIO notifica al frontend
           │
           └─→ Tarjeta se mueve sola en el tablero Kanban 🚀
```

## Event-Driven Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         EVENT BUS                               │
│                     (SocketIOEventBus)                         │
└─────────────┬──────────────────────────┬───────────────────────┘
              │                          │
              │ Publish                  │ Subscribe
              │                          │
    ┌─────────▼─────────┐      ┌────────▼────────┐
    │   PRODUCERS       │      │   CONSUMERS      │
    │ • ticket_service  │      │ • Frontend (WS)  │
    │ • webhooks        │      │ • Workflows      │
    │ • ai_service      │      │ • Notifications  │
    └───────────────────┘      └──────────────────┘

Eventos:
• ticket.created        → Ticket nuevo creado
• ticket.created.ai     → Ticket creado por IA
• ticket.moved          → Ticket movido manualmente
• ticket.moved.auto     → Ticket movido por Git-Sync
• ticket.assigned       → Ticket asignado a usuario
```

## Smart Permissions (Context-Aware)

```
User.can_edit_ticket(ticket) → bool

┌─────────────────────────────────────────────┐
│   VERIFICACIONES (en orden)                 │
├─────────────────────────────────────────────┤
│ 1. ¿Es Admin?              → ✅ ALLOW       │
│ 2. ¿Es Stakeholder?        → ❌ DENY        │
│ 3. ¿Es el creador?         → ✅ ALLOW       │
│ 4. ¿Está asignado?         → ✅ ALLOW       │
│ 5. ¿Hizo commits en la rama? → ✅ ALLOW    │
│ 6. Ninguna aplica          → ❌ DENY        │
└─────────────────────────────────────────────┘

Ejemplo:
• Developer hace push en "feature/BF-123-..."
• Sistema registra: ticket.related_git_authors = ["developer_gh"]
• Cuando developer intenta editar BF-123:
  → user.github_username == "developer_gh"
  → "developer_gh" in ticket.related_git_authors
  → ✅ PERMITIDO (Smart Permission automático)
```

## Stack Técnico por Capa

### Domain Layer (Puro Python)
- Dataclasses para entidades
- Enums para estados
- Lógica de negocio sin dependencias

### Application Layer
- Casos de uso puros
- Orquestación de servicios
- Lógica de flujos

### Infrastructure Layer

**Web:**
- Flask 3.0 (REST API)
- Flask-SocketIO (WebSocket)
- Flask-CORS (Cross-origin)

**Database:**
- SQLAlchemy (ORM)
- PostgreSQL (producción)
- SQLite (desarrollo)

**Real-time:**
- SocketIO (WebSocket)
- Redis (message queue)

**AI:**
- OpenAI API (GPT-4)
- LangChain (próximamente)

**Integrations:**
- GitHub API
- Slack API (próximamente)
- Teams Webhooks (próximamente)

## Principios SOLID Aplicados

### Single Responsibility
Cada clase tiene una responsabilidad única:
- `TicketService`: Solo lógica de tickets
- `AIService`: Solo lógica de IA
- `TicketRepository`: Solo acceso a datos de tickets

### Open/Closed
Abierto a extensión, cerrado a modificación:
- Nuevos adaptadores sin cambiar el dominio
- Nuevos eventos sin cambiar el core

### Liskov Substitution
Los adaptadores son intercambiables:
- `OpenAIAdapter` ↔️ `MockAIAdapter`
- `PostgreSQL` ↔️ `SQLite`

### Interface Segregation
Interfaces específicas (puertos):
- `ITicketRepository` para tickets
- `IAIService` para IA
- No una interfaz gigante

### Dependency Inversion
El dominio no depende de nada:
- `TicketService` depende de `ITicketRepository` (abstracción)
- No de `SQLAlchemy` o `PostgreSQL` (implementación)

## Ventajas de esta Arquitectura

✅ **Testeable**: Fácil usar mocks, sin dependencias externas en el core
✅ **Mantenible**: Cambios aislados por capas
✅ **Escalable**: Agregar features sin romper existentes
✅ **Flexible**: Cambiar PostgreSQL por MongoDB sin tocar el dominio
✅ **Documentado**: El código es auto-documentado por su estructura

---

**Esta arquitectura garantiza que el sistema pueda crecer sin convertirse en un monolito inmanejable.**
