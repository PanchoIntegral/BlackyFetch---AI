"""
BlackyFetch - Dashboard Controller
Blueprint de Flask para endpoints del dashboard.
"""
from flask import Blueprint, jsonify
from typing import Optional
from datetime import datetime, timedelta

from ...application.ticket_service import TicketService
from ...domain.models import TicketStatus


dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


# Dependency Injection
ticket_service: Optional[TicketService] = None
comment_repo = None


def init_dashboard_controller(service: TicketService, comments_repository=None):
    """Inicializa el controller con el servicio de tickets"""
    global ticket_service, comment_repo
    ticket_service = service
    comment_repo = comments_repository


@dashboard_bp.route('/stats/<project_id>', methods=['GET'])
def get_dashboard_stats(project_id: str):
    """
    Obtiene las estadísticas del dashboard para un proyecto.

    Returns:
    {
        "total_tickets": int,
        "completed_tickets": int,
        "in_progress_tickets": int,
        "progress_percentage": int,
        "tickets_by_status": {
            "backlog": int,
            "todo": int,
            "in_progress": int,
            "in_review": int,
            "done": int
        },
        "new_tickets_today": int,
        "sprint": {
            "name": str,
            "days_remaining": int,
            "end_date": str,
            "velocity": int
        }
    }
    """
    try:
        tickets = ticket_service.get_tickets_by_project(project_id)

        # Calculate stats
        total_tickets = len(tickets)
        completed_tickets = len([t for t in tickets if t.status == TicketStatus.DONE])
        in_progress_tickets = len([t for t in tickets if t.status == TicketStatus.IN_PROGRESS])
        in_review_tickets = len([t for t in tickets if t.status == TicketStatus.IN_REVIEW])

        # Progress percentage
        progress = round((completed_tickets / total_tickets) * 100) if total_tickets > 0 else 0

        # Tickets by status
        tickets_by_status = {
            'backlog': len([t for t in tickets if t.status == TicketStatus.BACKLOG]),
            'todo': len([t for t in tickets if t.status == TicketStatus.TODO]),
            'in_progress': in_progress_tickets,
            'in_review': in_review_tickets,
            'done': completed_tickets,
            'archived': len([t for t in tickets if t.status == TicketStatus.ARCHIVED]),
        }

        # New tickets today
        today = datetime.utcnow().date()
        new_today = len([t for t in tickets if t.created_at.date() == today])

        # Sprint info (mock for now - can be extended with Sprint model)
        # Assuming 2-week sprints ending on Friday
        now = datetime.utcnow()
        days_until_friday = (4 - now.weekday()) % 7
        if days_until_friday == 0 and now.hour >= 18:
            days_until_friday = 7
        sprint_end = now + timedelta(days=days_until_friday + 7)  # Next Friday + 1 week
        days_remaining = (sprint_end.date() - now.date()).days

        # Calculate velocity (completed tickets with estimated hours)
        velocity = sum(t.estimated_hours or 0 for t in tickets if t.status == TicketStatus.DONE)

        return jsonify({
            'total_tickets': total_tickets,
            'completed_tickets': completed_tickets,
            'in_progress_tickets': in_progress_tickets,
            'in_review_tickets': in_review_tickets,
            'progress_percentage': progress,
            'tickets_by_status': tickets_by_status,
            'new_tickets_today': new_today,
            'sprint': {
                'name': f'Sprint {now.isocalendar()[1]}',
                'days_remaining': days_remaining,
                'end_date': sprint_end.strftime('%b %d'),
                'velocity': int(velocity)
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/activity/<project_id>', methods=['GET'])
def get_recent_activity(project_id: str):
    """
    Obtiene la actividad reciente del proyecto.

    Returns:
    {
        "activities": [
            {
                "id": str,
                "type": "ticket_created" | "ticket_moved" | "comment_added" | "ticket_assigned",
                "user": { "id": str, "username": str },
                "ticket": { "id": str, "title": str },
                "message": str,
                "created_at": str
            }
        ]
    }
    """
    try:
        tickets = ticket_service.get_tickets_by_project(project_id)

        # Build activity from tickets (sorted by updated_at desc)
        activities = []

        for ticket in sorted(tickets, key=lambda t: t.updated_at, reverse=True)[:10]:
            # Determine activity type based on ticket state
            activity_type = 'ticket_updated'
            message = f'Updated ticket'

            if ticket.created_at == ticket.updated_at:
                activity_type = 'ticket_created'
                message = 'Created a new ticket'
            elif ticket.status == TicketStatus.DONE:
                activity_type = 'ticket_completed'
                message = 'Completed ticket'
            elif ticket.status == TicketStatus.IN_PROGRESS:
                activity_type = 'ticket_started'
                message = 'Started working on'
            elif ticket.status == TicketStatus.IN_REVIEW:
                activity_type = 'ticket_review'
                message = 'Moved to review'

            # Calculate relative time
            now = datetime.utcnow()
            diff = now - ticket.updated_at
            if diff.seconds < 60:
                time_ago = 'Just now'
            elif diff.seconds < 3600:
                mins = diff.seconds // 60
                time_ago = f'{mins} min{"s" if mins > 1 else ""} ago'
            elif diff.seconds < 86400:
                hours = diff.seconds // 3600
                time_ago = f'{hours} hour{"s" if hours > 1 else ""} ago'
            else:
                days = diff.days
                time_ago = f'{days} day{"s" if days > 1 else ""} ago'

            activities.append({
                'id': f'activity-{ticket.id}',
                'type': activity_type,
                'user': {
                    'id': ticket.assigned_to or ticket.created_by or 'unknown',
                    'username': ticket.assigned_to or ticket.created_by or 'System'
                },
                'ticket': {
                    'id': ticket.id,
                    'title': ticket.title
                },
                'message': message,
                'time_ago': time_ago,
                'created_at': ticket.updated_at.isoformat()
            })

        return jsonify({
            'activities': activities[:5]  # Return only last 5
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'dashboard'}), 200
