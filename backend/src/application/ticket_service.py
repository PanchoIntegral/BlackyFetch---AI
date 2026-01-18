"""
BlackyFetch - Ticket Service
Casos de uso relacionados con la gestión de tickets.
Orquesta las operaciones del dominio.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..domain.models import Ticket, User, TicketStatus
from ..domain.ports import (
    ITicketRepository,
    IUserRepository,
    IEventBus,
    INotificationService,
    IAIService
)


class TicketService:
    """
    Servicio de aplicación para tickets.
    Contiene los casos de uso principales del sistema.
    """
    
    def __init__(
        self,
        ticket_repo: ITicketRepository,
        user_repo: IUserRepository,
        event_bus: IEventBus,
        notification_service: INotificationService,
        ai_service: Optional[IAIService] = None
    ):
        self.ticket_repo = ticket_repo
        self.user_repo = user_repo
        self.event_bus = event_bus
        self.notification_service = notification_service
        self.ai_service = ai_service
    
    def create_ticket(
        self,
        title: str,
        description: str,
        created_by: str,
        project_id: str,
        priority: str = "medium",
        assigned_to: Optional[str] = None
    ) -> Ticket:
        """
        Caso de uso: Crear un ticket manualmente.
        
        Args:
            title: Título del ticket
            description: Descripción detallada
            created_by: ID del usuario creador
            project_id: ID del proyecto
            priority: Prioridad (low, medium, high, critical)
            assigned_to: ID del usuario asignado (opcional)
        
        Returns:
            Ticket creado
        """
        # Crear ticket
        from ..domain.models import TicketPriority
        ticket = Ticket(
            title=title,
            description=description,
            created_by=created_by,
            project_id=project_id,
            priority=TicketPriority[priority.upper()],
            assigned_to=assigned_to,
            status=TicketStatus.BACKLOG
        )
        
        # Persistir
        ticket = self.ticket_repo.create(ticket)
        
        # Publicar evento
        self.event_bus.publish("ticket.created", {
            "ticket_id": ticket.id,
            "project_id": ticket.project_id,
            "created_by": ticket.created_by
        })
        
        # Notificar
        self.notification_service.notify_ticket_created(ticket)
        
        return ticket
    
    def create_ticket_from_natural_language(
        self,
        message: str,
        created_by: str,
        project_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Ticket:
        """
        Caso de uso: Crear ticket desde lenguaje natural usando IA.
        Este es el corazón del "Copiloto Activo".
        
        Args:
            message: Mensaje en lenguaje natural
            created_by: ID del usuario
            project_id: ID del proyecto
            context: Contexto adicional (canal de Slack, etc.)
        
        Returns:
            Ticket generado por IA
        """
        if not self.ai_service:
            raise ValueError("AI Service not configured")
        
        # Usar IA para parsear el mensaje
        ticket = self.ai_service.parse_natural_language_to_ticket(
            message,
            context=context or {}
        )
        
        # Completar información
        ticket.created_by = created_by
        ticket.project_id = project_id
        ticket.ai_generated = True
        ticket.original_message = message
        ticket.status = TicketStatus.BACKLOG
        
        # Persistir
        ticket = self.ticket_repo.create(ticket)
        
        # Publicar evento
        self.event_bus.publish("ticket.created.ai", {
            "ticket_id": ticket.id,
            "project_id": ticket.project_id,
            "original_message": message
        })
        
        # Notificar
        self.notification_service.notify_ticket_created(ticket)
        
        return ticket
    
    def move_ticket(
        self,
        ticket_id: str,
        new_status: str,
        user_id: str,
        auto_moved: bool = False
    ) -> Ticket:
        """
        Caso de uso: Mover ticket a un nuevo estado.
        
        Args:
            ticket_id: ID del ticket
            new_status: Nuevo estado
            user_id: ID del usuario que mueve
            auto_moved: Si fue movido automáticamente por Git-Sync
        
        Returns:
            Ticket actualizado
        """
        ticket = self.ticket_repo.get_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {ticket_id} not found")
        
        # Verificar permisos
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.can_edit_ticket(ticket):
            raise PermissionError(f"User {user_id} cannot edit ticket {ticket_id}")
        
        old_status = ticket.status.value
        ticket.move_to(TicketStatus[new_status.upper()])
        
        # Persistir
        ticket = self.ticket_repo.update(ticket)
        
        # Publicar evento
        self.event_bus.publish("ticket.moved", {
            "ticket_id": ticket.id,
            "old_status": old_status,
            "new_status": new_status,
            "auto_moved": auto_moved,
            "moved_by": user_id
        })
        
        # Notificar
        self.notification_service.notify_ticket_moved(ticket, old_status, new_status)
        
        return ticket
    
    def assign_ticket(
        self,
        ticket_id: str,
        assigned_to: str,
        assigned_by: str
    ) -> Ticket:
        """
        Caso de uso: Asignar ticket a un usuario.
        
        Args:
            ticket_id: ID del ticket
            assigned_to: ID del usuario a asignar
            assigned_by: ID del usuario que asigna
        
        Returns:
            Ticket actualizado
        """
        ticket = self.ticket_repo.get_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {ticket_id} not found")
        
        user = self.user_repo.get_by_id(assigned_to)
        if not user:
            raise ValueError(f"User {assigned_to} not found")
        
        ticket.assign_to_user(assigned_to)
        ticket = self.ticket_repo.update(ticket)
        
        # Publicar evento
        self.event_bus.publish("ticket.assigned", {
            "ticket_id": ticket.id,
            "assigned_to": assigned_to,
            "assigned_by": assigned_by
        })
        
        # Notificar
        self.notification_service.notify_ticket_assigned(ticket, user)
        
        return ticket
    
    def process_git_push(
        self,
        repo: str,
        branch: str,
        commit_hash: str,
        author: str,
        commit_message: str
    ) -> Optional[Ticket]:
        """
        Caso de uso: Procesar un push de Git (Git-Sync).
        Mueve automáticamente tickets basándose en la actividad.
        
        Args:
            repo: Repositorio
            branch: Rama
            commit_hash: Hash del commit
            author: Autor del commit
            commit_message: Mensaje del commit
        
        Returns:
            Ticket si se encontró y actualizó, None si no
        """
        # Buscar ticket asociado a la rama
        ticket = self.ticket_repo.find_by_git_branch(branch)
        
        if not ticket:
            # Intentar extraer ID del ticket desde el nombre de la rama o commit
            # Ej: "feature/BF-123-login-fix" o mensaje "#BF-123"
            return None
        
        # Registrar actividad de Git
        ticket.add_git_activity(branch, author, commit_hash)
        
        # Determinar si mover automáticamente
        auto_move = False
        new_status = None
        
        # Lógica de auto-movimiento
        if ticket.status == TicketStatus.BACKLOG or ticket.status == TicketStatus.TODO:
            # Si hay un commit, el ticket pasa a "In Progress"
            new_status = TicketStatus.IN_PROGRESS
            auto_move = True
        elif "review" in commit_message.lower() or "pr" in commit_message.lower():
            # Si el mensaje menciona review, mover a "In Review"
            new_status = TicketStatus.IN_REVIEW
            auto_move = True
        
        if auto_move and new_status:
            old_status = ticket.status.value
            ticket.move_to(new_status)
            
            # Obtener usuario por GitHub username
            user = self.user_repo.get_by_github_username(author)
            
            # Persistir
            ticket = self.ticket_repo.update(ticket)
            
            # Publicar evento
            self.event_bus.publish("ticket.moved.auto", {
                "ticket_id": ticket.id,
                "old_status": old_status,
                "new_status": new_status.value,
                "trigger": "git_push",
                "branch": branch,
                "commit": commit_hash
            })
            
            # Notificar
            self.notification_service.notify_ticket_moved(
                ticket,
                old_status,
                new_status.value
            )
        else:
            # Solo actualizar metadata
            ticket = self.ticket_repo.update(ticket)
        
        return ticket
    
    def get_tickets_by_project(self, project_id: str) -> List[Ticket]:
        """Obtiene todos los tickets de un proyecto"""
        return self.ticket_repo.get_by_project(project_id)
    
    def get_ticket_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Obtiene un ticket por ID"""
        return self.ticket_repo.get_by_id(ticket_id)
