"""
BlackyFetch - Database Adapter
Implementación de repositorios usando SQLAlchemy.
"""
from typing import List, Optional
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Float, Text, Enum as SQLEnum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import uuid

from ...domain.models import (
    Ticket, User, Project, Comment,
    TicketStatus, TicketPriority, UserRole, ProjectMethodology
)
from ...domain.ports import (
    ITicketRepository,
    IUserRepository,
    IProjectRepository,
    ICommentRepository
)

Base = declarative_base()


# ============================================================================
# ORM MODELS (Entidades de Persistencia)
# ============================================================================

class TicketORM(Base):
    """Modelo ORM para Ticket"""
    __tablename__ = 'tickets'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.BACKLOG)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.MEDIUM)
    
    created_by = Column(String(36))
    assigned_to = Column(String(36))
    project_id = Column(String(36))
    
    related_git_branches = Column(JSON, default=list)
    related_git_authors = Column(JSON, default=list)
    related_commits = Column(JSON, default=list)
    
    tags = Column(JSON, default=list)
    estimated_hours = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    ai_generated = Column(Boolean, default=False)
    original_message = Column(Text)


class UserORM(Base):
    """Modelo ORM para User"""
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.BUILDER)
    github_username = Column(String(100))
    slack_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class ProjectORM(Base):
    """Modelo ORM para Project"""
    __tablename__ = 'projects'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    github_repo = Column(String(255))
    slack_channel = Column(String(100))

    owner_id = Column(String(36))
    team_members = Column(JSON, default=list)

    methodology = Column(String(20), default='kanban')

    auto_move_enabled = Column(Boolean, default=True)
    ai_assistant_enabled = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class CommentORM(Base):
    """Modelo ORM para Comment"""
    __tablename__ = 'comments'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime)
    is_system_message = Column(Boolean, default=False)


# ============================================================================
# MAPPERS (Conversión entre Domain y ORM)
# ============================================================================

class TicketMapper:
    """Mapea entre Ticket (dominio) y TicketORM (persistencia)"""
    
    @staticmethod
    def to_orm(ticket: Ticket) -> TicketORM:
        """Convierte Ticket de dominio a ORM"""
        return TicketORM(
            id=ticket.id,
            title=ticket.title,
            description=ticket.description,
            status=ticket.status,
            priority=ticket.priority,
            created_by=ticket.created_by,
            assigned_to=ticket.assigned_to,
            project_id=ticket.project_id,
            related_git_branches=ticket.related_git_branches,
            related_git_authors=ticket.related_git_authors,
            related_commits=ticket.related_commits,
            tags=ticket.tags,
            estimated_hours=ticket.estimated_hours,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            ai_generated=ticket.ai_generated,
            original_message=ticket.original_message
        )
    
    @staticmethod
    def to_domain(orm: TicketORM) -> Ticket:
        """Convierte TicketORM a Ticket de dominio"""
        return Ticket(
            id=orm.id,
            title=orm.title,
            description=orm.description,
            status=orm.status,
            priority=orm.priority,
            created_by=orm.created_by,
            assigned_to=orm.assigned_to,
            project_id=orm.project_id,
            related_git_branches=orm.related_git_branches or [],
            related_git_authors=orm.related_git_authors or [],
            related_commits=orm.related_commits or [],
            tags=orm.tags or [],
            estimated_hours=orm.estimated_hours,
            created_at=orm.created_at,
            updated_at=orm.updated_at,
            ai_generated=orm.ai_generated,
            original_message=orm.original_message
        )


class UserMapper:
    """Mapea entre User (dominio) y UserORM (persistencia)"""
    
    @staticmethod
    def to_orm(user: User) -> UserORM:
        return UserORM(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role,
            github_username=user.github_username,
            slack_id=user.slack_id,
            created_at=user.created_at,
            is_active=user.is_active
        )
    
    @staticmethod
    def to_domain(orm: UserORM) -> User:
        return User(
            id=orm.id,
            email=orm.email,
            username=orm.username,
            role=orm.role,
            github_username=orm.github_username,
            slack_id=orm.slack_id,
            created_at=orm.created_at,
            is_active=orm.is_active
        )


# ============================================================================
# REPOSITORY IMPLEMENTATIONS
# ============================================================================

class TicketRepository(ITicketRepository):
    """Implementación del repositorio de Tickets usando SQLAlchemy"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, ticket: Ticket) -> Ticket:
        if not ticket.id:
            ticket.id = str(uuid.uuid4())
        orm = TicketMapper.to_orm(ticket)
        self.session.add(orm)
        self.session.commit()
        self.session.refresh(orm)
        return TicketMapper.to_domain(orm)
    
    def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        orm = self.session.query(TicketORM).filter(TicketORM.id == ticket_id).first()
        return TicketMapper.to_domain(orm) if orm else None
    
    def get_by_project(self, project_id: str) -> List[Ticket]:
        orms = self.session.query(TicketORM).filter(TicketORM.project_id == project_id).all()
        return [TicketMapper.to_domain(orm) for orm in orms]
    
    def update(self, ticket: Ticket) -> Ticket:
        orm = self.session.query(TicketORM).filter(TicketORM.id == ticket.id).first()
        if not orm:
            raise ValueError(f"Ticket {ticket.id} not found")
        
        # Actualizar campos
        orm.title = ticket.title
        orm.description = ticket.description
        orm.status = ticket.status
        orm.priority = ticket.priority
        orm.assigned_to = ticket.assigned_to
        orm.related_git_branches = ticket.related_git_branches
        orm.related_git_authors = ticket.related_git_authors
        orm.related_commits = ticket.related_commits
        orm.tags = ticket.tags
        orm.estimated_hours = ticket.estimated_hours
        orm.updated_at = datetime.utcnow()
        
        self.session.commit()
        self.session.refresh(orm)
        return TicketMapper.to_domain(orm)
    
    def delete(self, ticket_id: str) -> bool:
        orm = self.session.query(TicketORM).filter(TicketORM.id == ticket_id).first()
        if orm:
            self.session.delete(orm)
            self.session.commit()
            return True
        return False
    
    def find_by_git_branch(self, branch_name: str) -> Optional[Ticket]:
        # Buscar tickets que tengan esta rama en related_git_branches
        orms = self.session.query(TicketORM).all()
        for orm in orms:
            if orm.related_git_branches and branch_name in orm.related_git_branches:
                return TicketMapper.to_domain(orm)
        return None


class UserRepository(IUserRepository):
    """Implementación del repositorio de Users"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, user: User) -> User:
        if not user.id:
            user.id = str(uuid.uuid4())
        orm = UserMapper.to_orm(user)
        self.session.add(orm)
        self.session.commit()
        self.session.refresh(orm)
        return UserMapper.to_domain(orm)
    
    def get_by_id(self, user_id: str) -> Optional[User]:
        orm = self.session.query(UserORM).filter(UserORM.id == user_id).first()
        return UserMapper.to_domain(orm) if orm else None
    
    def get_by_email(self, email: str) -> Optional[User]:
        orm = self.session.query(UserORM).filter(UserORM.email == email).first()
        return UserMapper.to_domain(orm) if orm else None
    
    def get_by_github_username(self, github_username: str) -> Optional[User]:
        orm = self.session.query(UserORM).filter(UserORM.github_username == github_username).first()
        return UserMapper.to_domain(orm) if orm else None
    
    def update(self, user: User) -> User:
        orm = self.session.query(UserORM).filter(UserORM.id == user.id).first()
        if not orm:
            raise ValueError(f"User {user.id} not found")
        
        orm.email = user.email
        orm.username = user.username
        orm.role = user.role
        orm.github_username = user.github_username
        orm.slack_id = user.slack_id
        orm.is_active = user.is_active
        
        self.session.commit()
        self.session.refresh(orm)
        return UserMapper.to_domain(orm)


class ProjectRepository(IProjectRepository):
    """Implementación del repositorio de Projects"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, project: Project) -> Project:
        if not project.id:
            project.id = str(uuid.uuid4())
        orm = ProjectORM(
            id=project.id,
            name=project.name,
            description=project.description,
            github_repo=project.github_repo,
            slack_channel=project.slack_channel,
            owner_id=project.owner_id,
            team_members=project.team_members,
            methodology=project.methodology.value if project.methodology else 'kanban',
            auto_move_enabled=project.auto_move_enabled,
            ai_assistant_enabled=project.ai_assistant_enabled,
            created_at=project.created_at,
            is_active=project.is_active
        )
        self.session.add(orm)
        self.session.commit()
        return project

    def get_by_id(self, project_id: str) -> Optional[Project]:
        orm = self.session.query(ProjectORM).filter(ProjectORM.id == project_id).first()
        if not orm:
            return None
        return Project(
            id=orm.id,
            name=orm.name,
            description=orm.description,
            github_repo=orm.github_repo,
            slack_channel=orm.slack_channel,
            owner_id=orm.owner_id,
            team_members=orm.team_members or [],
            methodology=ProjectMethodology(orm.methodology) if orm.methodology else ProjectMethodology.KANBAN,
            auto_move_enabled=orm.auto_move_enabled,
            ai_assistant_enabled=orm.ai_assistant_enabled,
            created_at=orm.created_at,
            is_active=orm.is_active
        )

    def get_all(self) -> List[Project]:
        orms = self.session.query(ProjectORM).filter(ProjectORM.is_active == True).all()
        return [Project(
            id=orm.id,
            name=orm.name,
            description=orm.description,
            github_repo=orm.github_repo,
            slack_channel=orm.slack_channel,
            owner_id=orm.owner_id,
            team_members=orm.team_members or [],
            methodology=ProjectMethodology(orm.methodology) if orm.methodology else ProjectMethodology.KANBAN,
            auto_move_enabled=orm.auto_move_enabled,
            ai_assistant_enabled=orm.ai_assistant_enabled,
            created_at=orm.created_at,
            is_active=orm.is_active
        ) for orm in orms]

    def update(self, project: Project) -> Project:
        orm = self.session.query(ProjectORM).filter(ProjectORM.id == project.id).first()
        if not orm:
            raise ValueError(f"Project {project.id} not found")

        orm.name = project.name
        orm.description = project.description
        orm.github_repo = project.github_repo
        orm.slack_channel = project.slack_channel
        orm.team_members = project.team_members
        orm.methodology = project.methodology.value if project.methodology else 'kanban'
        orm.auto_move_enabled = project.auto_move_enabled
        orm.ai_assistant_enabled = project.ai_assistant_enabled
        orm.is_active = project.is_active

        self.session.commit()
        return project


class CommentRepository(ICommentRepository):
    """Implementación del repositorio de Comments"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, comment: Comment) -> Comment:
        if not comment.id:
            comment.id = str(uuid.uuid4())
        orm = CommentORM(
            id=comment.id,
            ticket_id=comment.ticket_id,
            user_id=comment.user_id,
            content=comment.content,
            created_at=comment.created_at,
            edited_at=comment.edited_at,
            is_system_message=comment.is_system_message
        )
        self.session.add(orm)
        self.session.commit()
        return comment
    
    def get_by_ticket(self, ticket_id: str) -> List[Comment]:
        orms = self.session.query(CommentORM).filter(CommentORM.ticket_id == ticket_id).all()
        return [Comment(
            id=orm.id,
            ticket_id=orm.ticket_id,
            user_id=orm.user_id,
            content=orm.content,
            created_at=orm.created_at,
            edited_at=orm.edited_at,
            is_system_message=orm.is_system_message
        ) for orm in orms]


# ============================================================================
# DATABASE FACTORY
# ============================================================================

class DatabaseFactory:
    """Factory para crear instancias de base de datos"""
    
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def create_tables(self):
        """Crea todas las tablas"""
        Base.metadata.create_all(self.engine)
    
    def get_session(self) -> Session:
        """Obtiene una sesión de base de datos"""
        return self.SessionLocal()
    
    def get_ticket_repository(self) -> TicketRepository:
        """Obtiene instancia del repositorio de Tickets"""
        return TicketRepository(self.get_session())
    
    def get_user_repository(self) -> UserRepository:
        """Obtiene instancia del repositorio de Users"""
        return UserRepository(self.get_session())
    
    def get_project_repository(self) -> ProjectRepository:
        """Obtiene instancia del repositorio de Projects"""
        return ProjectRepository(self.get_session())
    
    def get_comment_repository(self) -> CommentRepository:
        """Obtiene instancia del repositorio de Comments"""
        return CommentRepository(self.get_session())
