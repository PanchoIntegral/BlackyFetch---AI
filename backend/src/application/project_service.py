"""
BlackyFetch - Project Service
Capa de Aplicación: Casos de uso para gestión de proyectos.
"""
from typing import List, Optional
from datetime import datetime

from ..domain.models import Project, User, UserRole, ProjectMethodology
from ..domain.ports import IProjectRepository, IUserRepository, IEventBus, INotificationService


class ProjectService:
    """
    Servicio de aplicación para gestión de proyectos.
    Orquesta las operaciones de negocio relacionadas con proyectos.
    """

    def __init__(
        self,
        project_repo: IProjectRepository,
        user_repo: IUserRepository,
        ticket_repo=None,
        event_bus: Optional[IEventBus] = None,
        notification_service: Optional[INotificationService] = None
    ):
        self.project_repo = project_repo
        self.user_repo = user_repo
        self.ticket_repo = ticket_repo
        self.event_bus = event_bus
        self.notification_service = notification_service

    def create_project(
        self,
        name: str,
        description: str,
        owner_id: str,
        github_repo: Optional[str] = None,
        slack_channel: Optional[str] = None,
        team_members: Optional[List[str]] = None,
        methodology: str = 'kanban',
        auto_move_enabled: bool = True,
        ai_assistant_enabled: bool = True
    ) -> Project:
        """
        Crea un nuevo proyecto.

        Args:
            name: Nombre del proyecto
            description: Descripción del proyecto
            owner_id: ID del usuario propietario
            github_repo: URL del repositorio GitHub (opcional)
            slack_channel: Canal de Slack (opcional)
            team_members: Lista de IDs de miembros del equipo
            methodology: Metodología del proyecto (scrum/kanban)
            auto_move_enabled: Habilitar Git-Sync
            ai_assistant_enabled: Habilitar AI Copilot

        Returns:
            Project creado
        """
        # Convertir string a enum
        try:
            method_enum = ProjectMethodology(methodology)
        except ValueError:
            method_enum = ProjectMethodology.KANBAN

        # Crear entidad de dominio
        project = Project(
            name=name,
            description=description,
            owner_id=owner_id,
            github_repo=github_repo,
            slack_channel=slack_channel,
            team_members=team_members or [],
            methodology=method_enum,
            auto_move_enabled=auto_move_enabled,
            ai_assistant_enabled=ai_assistant_enabled,
            created_at=datetime.utcnow(),
            is_active=True
        )

        # Persistir
        created_project = self.project_repo.create(project)

        # Emitir evento
        if self.event_bus:
            self.event_bus.publish('project.created', {
                'project_id': created_project.id,
                'name': created_project.name,
                'owner_id': created_project.owner_id
            })

        # Notificar
        if self.notification_service:
            self.notification_service.send(
                user_id=owner_id,
                message=f"Proyecto '{name}' creado exitosamente",
                notification_type="project:created"
            )

        return created_project

    def get_project_by_id(self, project_id: str) -> Optional[Project]:
        """Obtiene un proyecto por ID"""
        return self.project_repo.get_by_id(project_id)

    def get_all_projects(self) -> List[Project]:
        """Obtiene todos los proyectos activos"""
        return self.project_repo.get_all()

    def get_user_projects(self, user_id: str) -> dict:
        """
        Obtiene los proyectos de un usuario organizados por tipo.

        Returns:
            {
                'owned': [...],
                'invited': [...],
                'archived': [...]
            }
        """
        all_projects = self.project_repo.get_all()

        owned = []
        invited = []
        archived = []

        for project in all_projects:
            if not project.is_active:
                archived.append(project)
            elif project.owner_id == user_id:
                owned.append(project)
            elif user_id in project.team_members:
                invited.append(project)

        return {
            'owned': owned,
            'invited': invited,
            'archived': archived
        }

    def update_project(
        self,
        project_id: str,
        user_id: str,
        **kwargs
    ) -> Project:
        """
        Actualiza un proyecto.

        Args:
            project_id: ID del proyecto
            user_id: ID del usuario que hace la actualización
            **kwargs: Campos a actualizar

        Returns:
            Proyecto actualizado

        Raises:
            ValueError: Si el proyecto no existe
            PermissionError: Si el usuario no tiene permisos
        """
        project = self.project_repo.get_by_id(project_id)

        if not project:
            raise ValueError(f"Proyecto {project_id} no encontrado")

        # Verificar permisos (solo owner puede editar)
        if project.owner_id != user_id:
            user = self.user_repo.get_by_id(user_id)
            if not user or user.role != UserRole.ADMIN:
                raise PermissionError("No tienes permisos para editar este proyecto")

        # Actualizar campos permitidos
        allowed_fields = [
            'name', 'description', 'github_repo', 'slack_channel',
            'team_members', 'auto_move_enabled', 'ai_assistant_enabled'
        ]

        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(project, field):
                setattr(project, field, value)

        # Persistir
        updated_project = self.project_repo.update(project)

        # Emitir evento
        if self.event_bus:
            self.event_bus.publish('project.updated', {
                'project_id': project_id,
                'updated_by': user_id,
                'changes': list(kwargs.keys())
            })

        return updated_project

    def archive_project(self, project_id: str, user_id: str) -> Project:
        """
        Archiva un proyecto (soft delete).

        Args:
            project_id: ID del proyecto
            user_id: ID del usuario que archiva

        Returns:
            Proyecto archivado
        """
        project = self.project_repo.get_by_id(project_id)

        if not project:
            raise ValueError(f"Proyecto {project_id} no encontrado")

        # Verificar permisos
        if project.owner_id != user_id:
            user = self.user_repo.get_by_id(user_id)
            if not user or user.role != UserRole.ADMIN:
                raise PermissionError("No tienes permisos para archivar este proyecto")

        project.is_active = False
        updated_project = self.project_repo.update(project)

        if self.event_bus:
            self.event_bus.publish('project.archived', {
                'project_id': project_id,
                'archived_by': user_id
            })

        return updated_project

    def add_team_member(self, project_id: str, user_id: str, member_id: str) -> Project:
        """
        Añade un miembro al equipo del proyecto.

        Args:
            project_id: ID del proyecto
            user_id: ID del usuario que añade (debe ser owner)
            member_id: ID del usuario a añadir

        Returns:
            Proyecto actualizado
        """
        project = self.project_repo.get_by_id(project_id)

        if not project:
            raise ValueError(f"Proyecto {project_id} no encontrado")

        # Verificar permisos
        if project.owner_id != user_id:
            raise PermissionError("Solo el propietario puede añadir miembros")

        # Verificar que el miembro existe
        member = self.user_repo.get_by_id(member_id)
        if not member:
            raise ValueError(f"Usuario {member_id} no encontrado")

        # Añadir si no está
        if member_id not in project.team_members:
            project.team_members.append(member_id)
            updated_project = self.project_repo.update(project)

            # Notificar al nuevo miembro
            if self.notification_service:
                self.notification_service.send(
                    user_id=member_id,
                    message=f"Has sido añadido al proyecto '{project.name}'",
                    notification_type="project:member_added"
                )

            return updated_project

        return project

    def remove_team_member(self, project_id: str, user_id: str, member_id: str) -> Project:
        """
        Elimina un miembro del equipo del proyecto.
        """
        project = self.project_repo.get_by_id(project_id)

        if not project:
            raise ValueError(f"Proyecto {project_id} no encontrado")

        if project.owner_id != user_id:
            raise PermissionError("Solo el propietario puede eliminar miembros")

        if member_id in project.team_members:
            project.team_members.remove(member_id)
            return self.project_repo.update(project)

        return project

    def get_project_stats(self, project_id: str) -> dict:
        """
        Obtiene estadísticas del proyecto.

        Returns:
            {
                'total_tickets': int,
                'tickets_by_status': {...},
                'team_size': int,
                'progress': float
            }
        """
        project = self.project_repo.get_by_id(project_id)

        if not project:
            raise ValueError(f"Proyecto {project_id} no encontrado")

        # Contar tickets si tenemos el repo
        tickets_by_status = {}
        total_tickets = 0
        done_tickets = 0

        if self.ticket_repo:
            tickets = self.ticket_repo.get_by_project(project_id)
            total_tickets = len(tickets)

            for ticket in tickets:
                status = ticket.status.value
                tickets_by_status[status] = tickets_by_status.get(status, 0) + 1
                if status == 'done':
                    done_tickets += 1

        # Calcular progreso
        progress = (done_tickets / total_tickets * 100) if total_tickets > 0 else 0

        return {
            'total_tickets': total_tickets,
            'tickets_by_status': tickets_by_status,
            'team_size': len(project.team_members) + 1,  # +1 por el owner
            'progress': round(progress, 1)
        }
