# BlackyFetch Backend

Backend del sistema de gestión de proyectos inteligente BlackyFetch.

## 🏗️ Arquitectura

Arquitectura Hexagonal (Puertos y Adaptadores) + Event-Driven:

```
backend/
├── app.py                 # Punto de entrada de la aplicación
├── config.py              # Configuración centralizada
├── requirements.txt       # Dependencias
├── src/
│   ├── domain/            # 🎯 Lógica de Negocio Pura
│   │   ├── models.py      # Entidades del dominio
│   │   └── ports.py       # Interfaces (Puertos)
│   ├── application/       # 🎭 Casos de Uso
│   │   ├── ticket_service.py
│   │   └── ai_service.py
│   └── infrastructure/    # 🔧 Implementaciones Técnicas
│       ├── adapters/      # Adaptadores (DB, AI, SocketIO)
│       └── web/           # Controllers y Webhooks
```

## 🚀 Instalación

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar la aplicación
python app.py
```

## 🔑 Características Principales

- **Smart Permissions**: Permisos dinámicos basados en contexto (commits, ramas)
- **IA Copiloto**: Creación automática de tickets desde lenguaje natural
- **Event-Driven**: Actualización en tiempo real vía SocketIO
- **Git-Sync**: Movimiento automático de tickets según actividad en Git
- **Webhooks**: Integración con GitHub, Slack, Teams

## 📦 Stack Tecnológico

- **Framework**: Flask 3.0
- **Database**: PostgreSQL + SQLAlchemy
- **Real-time**: Redis + SocketIO
- **AI**: OpenAI API + LangChain
- **Architecture**: Hexagonal + Event-Driven

## 🧪 Testing

```bash
pytest
pytest --cov=src
```

## 📝 Roadmap

- [x] Estructura base del proyecto
- [ ] Fase 1: MVP de creación de tickets con IA
- [ ] Fase 2: Webhooks de GitHub
- [ ] Fase 3: Smart Permissions
- [ ] Fase 4: Constructor visual de automatizaciones
