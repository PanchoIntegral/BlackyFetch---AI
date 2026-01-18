"""
BlackyFetch - Tickets Controller
Blueprint de Flask para endpoints de tickets.
"""
from flask import Blueprint, request, jsonify
from typing import Optional

from ...application.ticket_service import TicketService
from ...domain.models import TicketStatus


tickets_bp = Blueprint('tickets', __name__, url_prefix='/api/tickets')


# Dependency Injection (se configurará en app.py)
ticket_service: Optional[TicketService] = None


def init_tickets_controller(service: TicketService):
    """Inicializa el controller con el servicio de tickets"""
    global ticket_service
    ticket_service = service


@tickets_bp.route('/', methods=['POST'])
def create_ticket():
    """
    Crea un nuevo ticket manualmente.
    
    Body:
    {
        "title": "string",
        "description": "string",
        "project_id": "string",
        "created_by": "string",
        "priority": "medium",
        "assigned_to": "string" (optional)
    }
    """
    data = request.get_json()
    
    try:
        ticket = ticket_service.create_ticket(
            title=data['title'],
            description=data['description'],
            created_by=data['created_by'],
            project_id=data['project_id'],
            priority=data.get('priority', 'medium'),
            assigned_to=data.get('assigned_to')
        )
        
        return jsonify({
            'id': ticket.id,
            'title': ticket.title,
            'description': ticket.description,
            'status': ticket.status.value,
            'priority': ticket.priority.value,
            'created_by': ticket.created_by,
            'assigned_to': ticket.assigned_to,
            'project_id': ticket.project_id,
            'tags': ticket.tags,
            'created_at': ticket.created_at.isoformat()
        }), 201
        
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tickets_bp.route('/ai', methods=['POST'])
def create_ticket_from_ai():
    """
    Crea un ticket desde lenguaje natural usando IA.
    
    Body:
    {
        "message": "Hay que arreglar el login en mobile",
        "created_by": "user-id",
        "project_id": "project-id",
        "context": {} (optional)
    }
    """
    data = request.get_json()
    
    try:
        ticket = ticket_service.create_ticket_from_natural_language(
            message=data['message'],
            created_by=data['created_by'],
            project_id=data['project_id'],
            context=data.get('context')
        )
        
        return jsonify({
            'id': ticket.id,
            'title': ticket.title,
            'description': ticket.description,
            'status': ticket.status.value,
            'priority': ticket.priority.value,
            'tags': ticket.tags,
            'ai_generated': ticket.ai_generated,
            'original_message': ticket.original_message,
            'created_at': ticket.created_at.isoformat()
        }), 201
        
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tickets_bp.route('/<ticket_id>', methods=['GET'])
def get_ticket(ticket_id: str):
    """Obtiene un ticket por ID"""
    try:
        ticket = ticket_service.get_ticket_by_id(ticket_id)
        
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        return jsonify({
            'id': ticket.id,
            'title': ticket.title,
            'description': ticket.description,
            'status': ticket.status.value,
            'priority': ticket.priority.value,
            'created_by': ticket.created_by,
            'assigned_to': ticket.assigned_to,
            'project_id': ticket.project_id,
            'tags': ticket.tags,
            'estimated_hours': ticket.estimated_hours,
            'related_git_branches': ticket.related_git_branches,
            'related_git_authors': ticket.related_git_authors,
            'ai_generated': ticket.ai_generated,
            'created_at': ticket.created_at.isoformat(),
            'updated_at': ticket.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tickets_bp.route('/project/<project_id>', methods=['GET'])
def get_project_tickets(project_id: str):
    """Obtiene todos los tickets de un proyecto"""
    try:
        tickets = ticket_service.get_tickets_by_project(project_id)
        
        return jsonify({
            'tickets': [
                {
                    'id': t.id,
                    'title': t.title,
                    'status': t.status.value,
                    'priority': t.priority.value,
                    'assigned_to': t.assigned_to,
                    'tags': t.tags,
                    'created_at': t.created_at.isoformat(),
                    'updated_at': t.updated_at.isoformat()
                }
                for t in tickets
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tickets_bp.route('/<ticket_id>/move', methods=['PATCH'])
def move_ticket(ticket_id: str):
    """
    Mueve un ticket a un nuevo estado.
    
    Body:
    {
        "new_status": "in_progress",
        "user_id": "user-id"
    }
    """
    data = request.get_json()
    
    try:
        ticket = ticket_service.move_ticket(
            ticket_id=ticket_id,
            new_status=data['new_status'],
            user_id=data['user_id'],
            auto_moved=False
        )
        
        return jsonify({
            'id': ticket.id,
            'status': ticket.status.value,
            'updated_at': ticket.updated_at.isoformat()
        }), 200
        
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tickets_bp.route('/<ticket_id>/assign', methods=['PATCH'])
def assign_ticket(ticket_id: str):
    """
    Asigna un ticket a un usuario.
    
    Body:
    {
        "assigned_to": "user-id",
        "assigned_by": "user-id"
    }
    """
    data = request.get_json()
    
    try:
        ticket = ticket_service.assign_ticket(
            ticket_id=ticket_id,
            assigned_to=data['assigned_to'],
            assigned_by=data['assigned_by']
        )
        
        return jsonify({
            'id': ticket.id,
            'assigned_to': ticket.assigned_to,
            'updated_at': ticket.updated_at.isoformat()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tickets_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'tickets'}), 200
