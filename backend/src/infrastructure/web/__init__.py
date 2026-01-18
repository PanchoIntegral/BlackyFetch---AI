"""
BlackyFetch - Web Layer
Controllers y Blueprints de Flask.
"""
from .tickets_controller import tickets_bp, init_tickets_controller
from .webhooks_controller import webhooks_bp, init_webhooks_controller
from .dashboard_controller import dashboard_bp, init_dashboard_controller
from .projects_controller import projects_bp, init_projects_controller

__all__ = [
    'tickets_bp',
    'webhooks_bp',
    'dashboard_bp',
    'projects_bp',
    'init_tickets_controller',
    'init_webhooks_controller',
    'init_dashboard_controller',
    'init_projects_controller',
]
