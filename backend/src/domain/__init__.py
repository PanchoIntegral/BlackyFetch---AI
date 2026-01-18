"""
BlackyFetch - Domain Package
Capa de dominio puro sin dependencias externas.
"""
from .models import (
    Ticket,
    User,
    Project,
    WorkflowRule,
    Comment,
    TicketStatus,
    TicketPriority,
    UserRole,
    PermissionType
)

from .ports import (
    ITicketRepository,
    IUserRepository,
    IProjectRepository,
    ICommentRepository,
    IAIService,
    IEventBus,
    IGitService,
    ISlackService,
    ITeamsService,
    INotificationService
)

__all__ = [
    # Models
    'Ticket',
    'User',
    'Project',
    'WorkflowRule',
    'Comment',
    'TicketStatus',
    'TicketPriority',
    'UserRole',
    'PermissionType',
    # Ports
    'ITicketRepository',
    'IUserRepository',
    'IProjectRepository',
    'ICommentRepository',
    'IAIService',
    'IEventBus',
    'IGitService',
    'ISlackService',
    'ITeamsService',
    'INotificationService',
]
