"""
BlackyFetch - Main Application
Punto de entrada del backend con arquitectura hexagonal.
"""
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import redis

from config import get_config

# Importar adaptadores (Infraestructura)
from src.infrastructure.adapters import (
    DatabaseFactory,
    OpenAIAdapter,
    MockAIAdapter,
    SocketIOEventBus,
    SocketIONotificationService,
    GitHubAdapter
)

# Importar servicios (Aplicación)
from src.application import TicketService, AIService, ProjectService

# Importar controllers (Web)
from src.infrastructure.web import (
    tickets_bp,
    webhooks_bp,
    dashboard_bp,
    projects_bp,
    init_tickets_controller,
    init_webhooks_controller,
    init_dashboard_controller,
    init_projects_controller
)


def create_app(config_name: str = None):
    """
    Factory para crear la aplicación Flask.
    Implementa Dependency Injection manual.
    
    Args:
        config_name: Nombre de la configuración (development, production, testing)
    
    Returns:
        Tupla (app, socketio)
    """
    # Crear Flask app
    app = Flask(__name__)
    config = get_config(config_name)
    app.config.from_object(config)
    
    # CORS
    CORS(app, resources={
        r"/api/*": {"origins": config.CORS_ORIGINS}
    })
    
    # SocketIO para real-time
    socketio = SocketIO(
        app,
        cors_allowed_origins=config.SOCKETIO_CORS_ALLOWED_ORIGINS,
        message_queue=config.SOCKETIO_MESSAGE_QUEUE,
        async_mode='threading'
    )
    
    # ========================================================================
    # DEPENDENCY INJECTION - Infraestructura
    # ========================================================================
    
    # 1. Database
    db_factory = DatabaseFactory(config.SQLALCHEMY_DATABASE_URI)
    db_factory.create_tables()
    
    ticket_repo = db_factory.get_ticket_repository()
    user_repo = db_factory.get_user_repository()
    project_repo = db_factory.get_project_repository()
    comment_repo = db_factory.get_comment_repository()
    
    # 2. AI Service
    if config.OPENAI_API_KEY and not config.DEBUG:
        ai_adapter = OpenAIAdapter(
            api_key=config.OPENAI_API_KEY,
            model=config.OPENAI_MODEL
        )
    else:
        # Usar mock en desarrollo
        ai_adapter = MockAIAdapter()
        app.logger.info("Using Mock AI Adapter (no OpenAI API key)")
    
    # 3. Event Bus y Notificaciones
    event_bus = SocketIOEventBus(socketio)
    notification_service = SocketIONotificationService(socketio)
    
    # 4. Git Service
    git_service = GitHubAdapter(token=None)  # Token opcional
    
    # ========================================================================
    # DEPENDENCY INJECTION - Aplicación
    # ========================================================================
    
    # Servicios de aplicación
    ticket_service = TicketService(
        ticket_repo=ticket_repo,
        user_repo=user_repo,
        event_bus=event_bus,
        notification_service=notification_service,
        ai_service=ai_adapter
    )
    
    ai_service = AIService(ai_port=ai_adapter)

    # Servicio de proyectos
    project_service = ProjectService(
        project_repo=project_repo,
        user_repo=user_repo,
        ticket_repo=ticket_repo,
        event_bus=event_bus,
        notification_service=notification_service
    )

    # ========================================================================
    # DEPENDENCY INJECTION - Controllers
    # ========================================================================

    init_tickets_controller(ticket_service)
    init_webhooks_controller(ticket_service, config.GITHUB_WEBHOOK_SECRET)
    init_dashboard_controller(ticket_service, comment_repo)
    init_projects_controller(project_service)

    # Registrar Blueprints
    app.register_blueprint(tickets_bp)
    app.register_blueprint(webhooks_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(projects_bp)
    
    # ========================================================================
    # SOCKETIO EVENTS
    # ========================================================================
    
    @socketio.on('connect')
    def handle_connect():
        """Cliente conectado"""
        app.logger.info('Client connected')
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Cliente desconectado"""
        app.logger.info('Client disconnected')
    
    @socketio.on('subscribe_project')
    def handle_subscribe_project(data):
        """
        Cliente se suscribe a updates de un proyecto.
        
        Args:
            data: {"project_id": "abc123"}
        """
        project_id = data.get('project_id')
        if project_id:
            # TODO: Implementar rooms de SocketIO por proyecto
            app.logger.info(f'Client subscribed to project {project_id}')
    
    # ========================================================================
    # ROUTES GENERALES
    # ========================================================================
    
    @app.route('/')
    def index():
        """Root endpoint"""
        return {
            'name': 'BlackyFetch API',
            'version': '1.0.0',
            'architecture': 'Hexagonal + Event-Driven',
            'status': 'running'
        }
    
    @app.route('/health')
    def health():
        """Health check completo"""
        return {
            'status': 'healthy',
            'database': 'connected',
            'socketio': 'active',
            'ai_service': 'mock' if isinstance(ai_adapter, MockAIAdapter) else 'openai'
        }
    
    # ========================================================================
    # ERROR HANDLERS
    # ========================================================================
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal error: {error}')
        return {'error': 'Internal server error'}, 500
    
    return app, socketio


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == '__main__':
    # Crear aplicación
    app, socketio = create_app()
    
    # Obtener configuración
    config = get_config()
    
    # Log inicial
    app.logger.info('=' * 60)
    app.logger.info('🚀 BlackyFetch Backend Starting...')
    app.logger.info('=' * 60)
    app.logger.info(f'Environment: {app.config.get("FLASK_ENV", "development")}')
    app.logger.info(f'Debug Mode: {config.DEBUG}')
    app.logger.info(f'Database: {config.SQLALCHEMY_DATABASE_URI[:50]}...')
    app.logger.info(f'CORS Origins: {config.CORS_ORIGINS}')
    app.logger.info('=' * 60)
    
    # Iniciar servidor
    socketio.run(
        app,
        host='0.0.0.0',
        port=5001,
        debug=config.DEBUG,
        use_reloader=config.DEBUG
    )
