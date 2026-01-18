"""
BlackyFetch - Domain Ports
Interfaces (Puertos) que definen contratos sin implementación.
Siguiendo el principio de Inversión de Dependencias (SOLID).
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from .models import Ticket, User, Project, WorkflowRule, Comment


# ============================================================================
# REPOSITORY PORTS (Acceso a Datos)
# ============================================================================

class ITicketRepository(ABC):
    """Puerto para repositorio de Tickets"""
    
    @abstractmethod
    def create(self, ticket: Ticket) -> Ticket:
        """Crea un nuevo ticket"""
        pass
    
    @abstractmethod
    def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Obtiene un ticket por ID"""
        pass
    
    @abstractmethod
    def get_by_project(self, project_id: str) -> List[Ticket]:
        """Obtiene todos los tickets de un proyecto"""
        pass
    
    @abstractmethod
    def update(self, ticket: Ticket) -> Ticket:
        """Actualiza un ticket existente"""
        pass
    
    @abstractmethod
    def delete(self, ticket_id: str) -> bool:
        """Elimina un ticket"""
        pass
    
    @abstractmethod
    def find_by_git_branch(self, branch_name: str) -> Optional[Ticket]:
        """Encuentra un ticket asociado a una rama de Git"""
        pass


class IUserRepository(ABC):
    """Puerto para repositorio de Usuarios"""
    
    @abstractmethod
    def create(self, user: User) -> User:
        pass
    
    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def get_by_github_username(self, github_username: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def update(self, user: User) -> User:
        pass


class IProjectRepository(ABC):
    """Puerto para repositorio de Proyectos"""
    
    @abstractmethod
    def create(self, project: Project) -> Project:
        pass
    
    @abstractmethod
    def get_by_id(self, project_id: str) -> Optional[Project]:
        pass
    
    @abstractmethod
    def get_all(self) -> List[Project]:
        pass
    
    @abstractmethod
    def update(self, project: Project) -> Project:
        pass


class ICommentRepository(ABC):
    """Puerto para repositorio de Comentarios"""
    
    @abstractmethod
    def create(self, comment: Comment) -> Comment:
        pass
    
    @abstractmethod
    def get_by_ticket(self, ticket_id: str) -> List[Comment]:
        pass


# ============================================================================
# AI SERVICE PORTS (Servicios de IA)
# ============================================================================

class IAIService(ABC):
    """Puerto para servicios de Inteligencia Artificial"""
    
    @abstractmethod
    def parse_natural_language_to_ticket(self, message: str, context: Dict[str, Any] = None) -> Ticket:
        """
        Convierte un mensaje en lenguaje natural a un ticket estructurado.
        
        Args:
            message: Mensaje del usuario ("Hay que arreglar el login en mobile")
            context: Contexto adicional (usuario, proyecto, etc.)
        
        Returns:
            Ticket con título, descripción y tags generados
        """
        pass
    
    @abstractmethod
    def suggest_tags(self, ticket: Ticket) -> List[str]:
        """Sugiere tags relevantes para un ticket"""
        pass
    
    @abstractmethod
    def estimate_complexity(self, ticket: Ticket) -> float:
        """Estima la complejidad/horas de un ticket"""
        pass
    
    @abstractmethod
    def analyze_sentiment(self, message: str) -> Dict[str, Any]:
        """Analiza el sentimiento de un mensaje (para priorización)"""
        pass


# ============================================================================
# EVENT BUS PORT (Event-Driven)
# ============================================================================

class IEventBus(ABC):
    """Puerto para el bus de eventos (Event-Driven Architecture)"""
    
    @abstractmethod
    def publish(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Publica un evento en el sistema.
        
        Args:
            event_type: Tipo de evento ("ticket.created", "ticket.moved", etc.)
            data: Datos del evento
        """
        pass
    
    @abstractmethod
    def subscribe(self, event_type: str, callback) -> None:
        """
        Suscribe un handler a un tipo de evento.
        
        Args:
            event_type: Tipo de evento a escuchar
            callback: Función a ejecutar cuando ocurra el evento
        """
        pass


# ============================================================================
# EXTERNAL INTEGRATION PORTS (Webhooks y APIs externas)
# ============================================================================

class IGitService(ABC):
    """Puerto para integración con Git (GitHub, GitLab, etc.)"""
    
    @abstractmethod
    def get_commit_info(self, repo: str, commit_hash: str) -> Dict[str, Any]:
        """Obtiene información de un commit"""
        pass
    
    @abstractmethod
    def get_branch_info(self, repo: str, branch_name: str) -> Dict[str, Any]:
        """Obtiene información de una rama"""
        pass
    
    @abstractmethod
    def extract_ticket_id_from_branch(self, branch_name: str) -> Optional[str]:
        """
        Extrae el ID del ticket desde el nombre de la rama.
        Ej: "feature/BF-123-login-fix" -> "BF-123"
        """
        pass


class ISlackService(ABC):
    """Puerto para integración con Slack"""
    
    @abstractmethod
    def send_message(self, channel: str, message: str) -> bool:
        """Envía un mensaje a un canal de Slack"""
        pass
    
    @abstractmethod
    def listen_to_channel(self, channel: str) -> None:
        """Escucha mensajes de un canal (para el Copiloto)"""
        pass


class ITeamsService(ABC):
    """Puerto para integración con Microsoft Teams"""
    
    @abstractmethod
    def send_message(self, webhook_url: str, message: str) -> bool:
        """Envía un mensaje a Teams"""
        pass


# ============================================================================
# NOTIFICATION PORT
# ============================================================================

class INotificationService(ABC):
    """Puerto para sistema de notificaciones en tiempo real"""
    
    @abstractmethod
    def notify_ticket_created(self, ticket: Ticket) -> None:
        """Notifica la creación de un ticket"""
        pass
    
    @abstractmethod
    def notify_ticket_moved(self, ticket: Ticket, old_status: str, new_status: str) -> None:
        """Notifica el movimiento de un ticket"""
        pass
    
    @abstractmethod
    def notify_ticket_assigned(self, ticket: Ticket, user: User) -> None:
        """Notifica la asignación de un ticket"""
        pass
