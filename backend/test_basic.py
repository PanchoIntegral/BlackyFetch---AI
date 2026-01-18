"""
BlackyFetch - Tests básicos
Ejemplos de tests unitarios con pytest.
"""
import pytest
from src.domain.models import Ticket, User, TicketStatus, TicketPriority, UserRole
from src.application.ai_service import AIService, SmartPermissionsService
from src.infrastructure.adapters import MockAIAdapter


def test_user_can_edit_ticket_as_creator():
    """Test: Usuario puede editar ticket que creó"""
    user = User(
        id="user-1",
        email="test@test.com",
        username="testuser",
        role=UserRole.BUILDER
    )
    
    ticket = Ticket(
        id="ticket-1",
        title="Test ticket",
        description="Test",
        created_by="user-1"
    )
    
    assert user.can_edit_ticket(ticket) == True


def test_user_can_edit_ticket_as_git_contributor():
    """Test: Usuario puede editar ticket si contribuyó en Git"""
    user = User(
        id="user-1",
        email="test@test.com",
        username="testuser",
        role=UserRole.BUILDER,
        github_username="testuser_gh"
    )
    
    ticket = Ticket(
        id="ticket-1",
        title="Test ticket",
        description="Test",
        created_by="user-2",
        related_git_authors=["testuser_gh"]
    )
    
    # Smart Permissions: puede editar porque contribuyó en Git
    assert user.can_edit_ticket(ticket) == True


def test_stakeholder_cannot_edit_ticket():
    """Test: Stakeholder no puede editar tickets"""
    user = User(
        id="user-1",
        email="test@test.com",
        username="stakeholder",
        role=UserRole.STAKEHOLDER
    )
    
    ticket = Ticket(
        id="ticket-1",
        title="Test ticket",
        description="Test",
        created_by="user-2"
    )
    
    assert user.can_edit_ticket(ticket) == False


def test_admin_can_edit_any_ticket():
    """Test: Admin puede editar cualquier ticket"""
    user = User(
        id="user-1",
        email="admin@test.com",
        username="admin",
        role=UserRole.ADMIN
    )
    
    ticket = Ticket(
        id="ticket-1",
        title="Test ticket",
        description="Test",
        created_by="user-2"
    )
    
    assert user.can_edit_ticket(ticket) == True


def test_ticket_move_to():
    """Test: Mover ticket a nuevo estado"""
    ticket = Ticket(
        id="ticket-1",
        title="Test",
        status=TicketStatus.BACKLOG
    )
    
    ticket.move_to(TicketStatus.IN_PROGRESS)
    
    assert ticket.status == TicketStatus.IN_PROGRESS


def test_ticket_add_git_activity():
    """Test: Agregar actividad de Git a ticket"""
    ticket = Ticket(id="ticket-1", title="Test")
    
    ticket.add_git_activity(
        branch="feature/BF-1-test",
        author="testuser",
        commit_hash="abc123"
    )
    
    assert "feature/BF-1-test" in ticket.related_git_branches
    assert "testuser" in ticket.related_git_authors
    assert "abc123" in ticket.related_commits


def test_ai_service_extract_ticket_id():
    """Test: Extraer ID de ticket desde texto"""
    ai_service = AIService(MockAIAdapter())
    
    # Desde rama
    ticket_id = ai_service.extract_ticket_id_from_text("feature/BF-123-login-fix")
    assert ticket_id == "BF-123"
    
    # Desde commit message
    ticket_id = ai_service.extract_ticket_id_from_text("Fixes #BF-456")
    assert ticket_id == "BF-456"


def test_ai_service_analyze_urgency():
    """Test: Analizar urgencia de mensaje"""
    ai_service = AIService(MockAIAdapter())
    
    # Mensaje urgente
    priority = ai_service.analyze_message_urgency("URGENTE: El sitio está caído")
    assert priority == TicketPriority.CRITICAL
    
    # Mensaje normal
    priority = ai_service.analyze_message_urgency("Agregar validación al formulario")
    assert priority == TicketPriority.MEDIUM
    
    # Mensaje de baja prioridad
    priority = ai_service.analyze_message_urgency("Cuando puedas, mejora el README")
    assert priority == TicketPriority.LOW


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
