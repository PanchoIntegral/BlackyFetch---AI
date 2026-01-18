"""
BlackyFetch - Infrastructure Adapters
Implementaciones de los puertos del dominio.
"""
from .database import (
    DatabaseFactory,
    TicketRepository,
    UserRepository,
    ProjectRepository,
    CommentRepository,
    Base
)

from .openai_adapter import OpenAIAdapter, MockAIAdapter
from .socketio_adapter import (
    SocketIOEventBus,
    SocketIONotificationService,
    RedisEventBus
)
from .git_adapter import GitHubAdapter, MockGitAdapter

__all__ = [
    # Database
    'DatabaseFactory',
    'TicketRepository',
    'UserRepository',
    'ProjectRepository',
    'CommentRepository',
    'Base',
    # AI
    'OpenAIAdapter',
    'MockAIAdapter',
    # Real-time
    'SocketIOEventBus',
    'SocketIONotificationService',
    'RedisEventBus',
    # Git
    'GitHubAdapter',
    'MockGitAdapter',
]
