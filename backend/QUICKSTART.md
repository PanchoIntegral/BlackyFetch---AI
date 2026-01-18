# 🚀 BlackyFetch Backend - Inicio Rápido

## Prerrequisitos

- Python 3.9+
- PostgreSQL 13+ (o SQLite para desarrollo)
- Redis (opcional, para producción)

## Instalación

### 1. Clonar y configurar entorno

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
source venv/bin/activate  # En macOS/Linux
# venv\Scripts\activate   # En Windows

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu configuración
nano .env  # o usa tu editor favorito
```

**Configuración mínima para desarrollo:**

```env
FLASK_ENV=development
DEBUG=True
DATABASE_URL=sqlite:///blackyfetch.db
SECRET_KEY=tu-secret-key-aqui

# Opcional: OpenAI (si quieres usar IA real)
OPENAI_API_KEY=sk-...

# Opcional: GitHub Webhooks
GITHUB_WEBHOOK_SECRET=tu-secret-aqui
```

### 3. Inicializar base de datos

```bash
python init_db.py
```

Este script:
- ✅ Crea las tablas de la base de datos
- ✅ Crea usuarios de ejemplo (admin, developer, stakeholder)
- ✅ Crea un proyecto de demostración

**Guarda los IDs** que se muestran, los necesitarás para probar la API.

### 4. Iniciar el servidor

```bash
python app.py
```

El servidor estará disponible en: `http://localhost:5000`

## 🧪 Probar la API

### Health Check

```bash
curl http://localhost:5000/health
```

### Crear ticket con IA

```bash
curl -X POST http://localhost:5000/api/tickets/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hay que arreglar el login en mobile",
    "project_id": "<PROJECT_ID>",
    "created_by": "<USER_ID>"
  }'
```

Reemplaza `<PROJECT_ID>` y `<USER_ID>` con los IDs que te dio `init_db.py`.

## 📚 Estructura del Proyecto

```
backend/
├── app.py                 # 🚪 Punto de entrada
├── config.py              # ⚙️  Configuración
├── init_db.py            # 🗄️  Script de inicialización
├── requirements.txt       # 📦 Dependencias
│
├── src/
│   ├── domain/           # 🎯 Lógica de negocio pura
│   │   ├── models.py     # Entidades: Ticket, User, Project
│   │   └── ports.py      # Interfaces (contratos)
│   │
│   ├── application/      # 🎭 Casos de uso
│   │   ├── ticket_service.py   # Lógica de tickets
│   │   └── ai_service.py       # Lógica de IA
│   │
│   └── infrastructure/   # 🔧 Implementaciones
│       ├── adapters/     # DB, OpenAI, SocketIO, Git
│       └── web/          # Controllers y Webhooks
```

## 🎯 Características Implementadas

### ✅ Core
- [x] Arquitectura Hexagonal (Puertos y Adaptadores)
- [x] Event-Driven Architecture (SocketIO)
- [x] Creación de tickets manual y con IA
- [x] Smart Permissions (permisos dinámicos basados en Git)
- [x] Gestión de usuarios, proyectos y tickets

### ✅ Integraciones
- [x] OpenAI API (con fallback a Mock)
- [x] GitHub Webhooks (Git-Sync)
- [x] SocketIO (actualizaciones en tiempo real)
- [x] PostgreSQL/SQLite

### 📋 Próximas Fases
- [ ] Slack Integration completa
- [ ] Microsoft Teams Integration
- [ ] Constructor visual de workflows
- [ ] Sistema de comentarios
- [ ] Autenticación JWT

## 🧪 Testing

```bash
# Ejecutar tests básicos
python test_basic.py

# O con pytest
pytest test_basic.py -v

# Con coverage
pytest --cov=src
```

## 📖 Documentación de API

Ver [API_EXAMPLES.md](API_EXAMPLES.md) para ejemplos completos de uso.

## 🐛 Troubleshooting

### Error: "No module named 'flask'"

```bash
# Asegúrate de tener el entorno virtual activado
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "Could not connect to database"

Si usas PostgreSQL:
```bash
# Verificar que PostgreSQL esté corriendo
psql -U postgres

# Crear base de datos
CREATE DATABASE blackyfetch;
```

Para desarrollo, usa SQLite:
```env
DATABASE_URL=sqlite:///blackyfetch.db
```

### Error: "OpenAI API key not found"

En desarrollo, no es necesario. El sistema usa MockAIAdapter automáticamente.

Si quieres usar IA real:
```env
OPENAI_API_KEY=sk-tu-api-key-aqui
DEBUG=False
```

## 🌐 Despliegue

### Producción con Gunicorn

```bash
# Instalar gunicorn
pip install gunicorn

# Ejecutar
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()[0]"
```

### Docker (próximamente)

```bash
# TODO: Agregar Dockerfile y docker-compose.yml
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Notas

- El sistema usa arquitectura hexagonal para facilitar testing y cambios
- Los adaptadores (OpenAI, GitHub) son intercambiables
- En desarrollo, todas las IAs usan mocks (no requieren API keys)
- SocketIO permite actualizaciones en tiempo real sin polling

## 🎓 Conceptos Clave

### Arquitectura Hexagonal
- **Domain**: Lógica de negocio pura, sin dependencias
- **Application**: Casos de uso, orquesta el dominio
- **Infrastructure**: Implementaciones técnicas (DB, APIs, Web)

### Event-Driven
- Los eventos se publican a través del Event Bus
- SocketIO notifica al frontend en tiempo real
- Permite workflows asíncronos y escalables

### Smart Permissions
- Permisos basados en contexto (Git activity)
- Si haces commits en una rama → Puedes editar el ticket
- Reduce burocracia, aumenta autonomía

---

**¿Dudas?** Consulta la documentación completa o abre un issue.
