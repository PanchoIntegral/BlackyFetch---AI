"""
BlackyFetch - Projects Controller
Blueprint de Flask para endpoints de proyectos.
"""
from flask import Blueprint, request, jsonify
from typing import Optional

from ...application.project_service import ProjectService


projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')


# Dependency Injection (se configurará en app.py)
project_service: Optional[ProjectService] = None


def init_projects_controller(service: ProjectService):
    """Inicializa el controller con el servicio de proyectos"""
    global project_service
    project_service = service


@projects_bp.route('/', methods=['GET'])
def get_projects():
    """
    Obtiene todos los proyectos del usuario.

    Query params:
        user_id: ID del usuario (requerido)

    Returns:
        {
            "owned": [...],
            "invited": [...],
            "archived": [...]
        }
    """
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    try:
        projects = project_service.get_user_projects(user_id)

        def serialize_project(p, is_invited=False):
            stats = project_service.get_project_stats(p.id)
            return {
                'id': p.id,
                'name': p.name,
                'description': p.description or '',
                'github_repo': p.github_repo,
                'slack_channel': p.slack_channel,
                'owner_id': p.owner_id,
                'team_members': p.team_members,
                'methodology': p.methodology.value if p.methodology else 'kanban',
                'auto_move_enabled': p.auto_move_enabled,
                'ai_assistant_enabled': p.ai_assistant_enabled,
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'is_active': p.is_active,
                'is_invited': is_invited,
                'progress': stats['progress'],
                'ticket_count': stats['total_tickets'],
                'team_size': stats['team_size']
            }

        return jsonify({
            'owned': [serialize_project(p) for p in projects['owned']],
            'invited': [serialize_project(p, is_invited=True) for p in projects['invited']],
            'archived': [serialize_project(p) for p in projects['archived']]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/', methods=['POST'])
def create_project():
    """
    Crea un nuevo proyecto.

    Body:
    {
        "name": "string",
        "description": "string",
        "owner_id": "string",
        "github_repo": "string" (optional),
        "slack_channel": "string" (optional),
        "team_members": ["user_id", ...] (optional),
        "auto_move_enabled": bool (optional, default: true),
        "ai_assistant_enabled": bool (optional, default: true)
    }
    """
    data = request.get_json()

    try:
        project = project_service.create_project(
            name=data['name'],
            description=data.get('description', ''),
            owner_id=data['owner_id'],
            github_repo=data.get('github_repo'),
            slack_channel=data.get('slack_channel'),
            team_members=data.get('team_members', []),
            methodology=data.get('methodology', 'kanban'),
            auto_move_enabled=data.get('auto_move_enabled', True),
            ai_assistant_enabled=data.get('ai_assistant_enabled', True)
        )

        return jsonify({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'github_repo': project.github_repo,
            'slack_channel': project.slack_channel,
            'owner_id': project.owner_id,
            'team_members': project.team_members,
            'methodology': project.methodology.value if project.methodology else 'kanban',
            'auto_move_enabled': project.auto_move_enabled,
            'ai_assistant_enabled': project.ai_assistant_enabled,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'is_active': project.is_active
        }), 201

    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<project_id>', methods=['GET'])
def get_project(project_id: str):
    """Obtiene un proyecto por ID"""
    try:
        project = project_service.get_project_by_id(project_id)

        if not project:
            return jsonify({'error': 'Project not found'}), 404

        stats = project_service.get_project_stats(project_id)

        return jsonify({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'github_repo': project.github_repo,
            'slack_channel': project.slack_channel,
            'owner_id': project.owner_id,
            'team_members': project.team_members,
            'methodology': project.methodology.value if project.methodology else 'kanban',
            'auto_move_enabled': project.auto_move_enabled,
            'ai_assistant_enabled': project.ai_assistant_enabled,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'is_active': project.is_active,
            'stats': stats
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<project_id>', methods=['PUT'])
def update_project(project_id: str):
    """
    Actualiza un proyecto.

    Body:
    {
        "user_id": "string" (requerido para permisos),
        "name": "string" (optional),
        "description": "string" (optional),
        ...
    }
    """
    data = request.get_json()

    try:
        user_id = data.pop('user_id', None)
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        project = project_service.update_project(
            project_id=project_id,
            user_id=user_id,
            **data
        )

        return jsonify({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'github_repo': project.github_repo,
            'slack_channel': project.slack_channel,
            'owner_id': project.owner_id,
            'team_members': project.team_members,
            'auto_move_enabled': project.auto_move_enabled,
            'ai_assistant_enabled': project.ai_assistant_enabled,
            'is_active': project.is_active
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<project_id>', methods=['DELETE'])
def delete_project(project_id: str):
    """
    Archiva un proyecto (soft delete).

    Query params:
        user_id: ID del usuario (requerido)
    """
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    try:
        project = project_service.archive_project(project_id, user_id)

        return jsonify({
            'id': project.id,
            'is_active': project.is_active,
            'message': 'Project archived successfully'
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<project_id>/members', methods=['POST'])
def add_member(project_id: str):
    """
    Añade un miembro al proyecto.

    Body:
    {
        "user_id": "string" (quien añade),
        "member_id": "string" (quien se añade)
    }
    """
    data = request.get_json()

    try:
        project = project_service.add_team_member(
            project_id=project_id,
            user_id=data['user_id'],
            member_id=data['member_id']
        )

        return jsonify({
            'id': project.id,
            'team_members': project.team_members,
            'message': 'Member added successfully'
        }), 200

    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<project_id>/members/<member_id>', methods=['DELETE'])
def remove_member(project_id: str, member_id: str):
    """
    Elimina un miembro del proyecto.

    Query params:
        user_id: ID del usuario que elimina (requerido)
    """
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    try:
        project = project_service.remove_team_member(
            project_id=project_id,
            user_id=user_id,
            member_id=member_id
        )

        return jsonify({
            'id': project.id,
            'team_members': project.team_members,
            'message': 'Member removed successfully'
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<project_id>/stats', methods=['GET'])
def get_project_stats(project_id: str):
    """Obtiene estadísticas del proyecto"""
    try:
        stats = project_service.get_project_stats(project_id)
        return jsonify(stats), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'projects'}), 200
