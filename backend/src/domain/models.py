"""
BlackyFetch - Domain Models
Capa de Dominio: Entidades puras del negocio sin dependencias externas.
Contiene las reglas de negocio core del sistema.
"""
from enum import Enum
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass, field


class TicketStatus(Enum):
    """Estados posibles de un ticket"""
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    ARCHIVED = "archived"


class TicketPriority(Enum):
    """Prioridades de los tickets"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class UserRole(Enum):
    """Roles de usuario en el sistema"""
    ADMIN = "admin"          # Configura el sistema
    BUILDER = "builder"      # Desarrollador activo
    STAKEHOLDER = "stakeholder"  # Solo lectura y comentarios


class PermissionType(Enum):
    """Tipos de permisos dinámicos"""
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    COMMENT = "comment"
    ASSIGN = "assign"


@dataclass
class User:
    """
    Usuario del sistema.
    Representa a una persona que interactúa con BlackyFetch.
    """
    id: Optional[str] = None
    email: str = ""
    username: str = ""
    role: UserRole = UserRole.BUILDER
    github_username: Optional[str] = None
    slack_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    def can_edit_ticket(self, ticket: 'Ticket') -> bool:
        """
        Smart Permissions: Determina si el usuario puede editar un ticket.
        Lógica de negocio para permisos dinámicos basados en contexto.
        """
        # Admin puede todo
        if self.role == UserRole.ADMIN:
            return True
        
        # Stakeholder solo puede comentar
        if self.role == UserRole.STAKEHOLDER:
            return False
        
        # Builder: Si es el creador o está asignado o es autor de commits relacionados
        if self.role == UserRole.BUILDER:
            if ticket.created_by == self.id:
                return True
            if ticket.assigned_to == self.id:
                return True
            if self.github_username and self.github_username in ticket.related_git_authors:
                return True
        
        return False


@dataclass
class Ticket:
    """
    Ticket o tarea del sistema.
    Representa una unidad de trabajo en el proyecto.
    """
    id: Optional[str] = None
    title: str = ""
    description: str = ""
    status: TicketStatus = TicketStatus.BACKLOG
    priority: TicketPriority = TicketPriority.MEDIUM
    
    # Relaciones
    created_by: Optional[str] = None  # User ID
    assigned_to: Optional[str] = None  # User ID
    project_id: Optional[str] = None
    
    # Metadatos de Smart Permissions
    related_git_branches: List[str] = field(default_factory=list)
    related_git_authors: List[str] = field(default_factory=list)
    related_commits: List[str] = field(default_factory=list)
    
    # Tags y categorización (generados por IA)
    tags: List[str] = field(default_factory=list)
    estimated_hours: Optional[float] = None
    
    # Timestamps
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    # IA Metadata
    ai_generated: bool = False
    original_message: Optional[str] = None  # Mensaje original de Slack/Teams
    
    def move_to(self, new_status: TicketStatus) -> None:
        """Mueve el ticket a un nuevo estado"""
        self.status = new_status
        self.updated_at = datetime.utcnow()
    
    def assign_to_user(self, user_id: str) -> None:
        """Asigna el ticket a un usuario"""
        self.assigned_to = user_id
        self.updated_at = datetime.utcnow()
    
    def add_git_activity(self, branch: str, author: str, commit_hash: str) -> None:
        """
        Registra actividad de Git relacionada con este ticket.
        Usado para Smart Permissions y movimiento automático.
        """
        if branch not in self.related_git_branches:
            self.related_git_branches.append(branch)
        if author not in self.related_git_authors:
            self.related_git_authors.append(author)
        if commit_hash not in self.related_commits:
            self.related_commits.append(commit_hash)
        self.updated_at = datetime.utcnow()


@dataclass
class Project:
    """
    Proyecto que contiene múltiples tickets.
    """
    id: Optional[str] = None
    name: str = ""
    description: str = ""
    github_repo: Optional[str] = None
    slack_channel: Optional[str] = None
    
    # Team
    owner_id: Optional[str] = None
    team_members: List[str] = field(default_factory=list)  # User IDs
    
    # Settings
    auto_move_enabled: bool = True  # Git-Sync activo
    ai_assistant_enabled: bool = True
    
    created_at: datetime = field(default_factory=datetime.utcnow)
    is_active: bool = True


@dataclass
class WorkflowRule:
    """
    Regla de automatización visual.
    Representa una regla del constructor de flujos.
    """
    id: Optional[str] = None
    project_id: str = ""
    name: str = ""
    
    # Trigger
    trigger_type: str = ""  # "git_push", "slack_message", "status_change"
    trigger_conditions: dict = field(default_factory=dict)
    
    # Actions
    actions: List[dict] = field(default_factory=list)
    
    # Metadata
    created_by: Optional[str] = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Comment:
    """
    Comentario en un ticket.
    """
    id: Optional[str] = None
    ticket_id: str = ""
    user_id: str = ""
    content: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None
    is_system_message: bool = False  # Para mensajes automáticos del Copiloto
