"""
BlackyFetch - Webhooks Controller
Manejo de webhooks de GitHub, Slack, Teams.
"""
from flask import Blueprint, request, jsonify
import hmac
import hashlib
import json
from typing import Optional

from ...application.ticket_service import TicketService


webhooks_bp = Blueprint('webhooks', __name__, url_prefix='/api/webhooks')


# Dependency Injection
ticket_service: Optional[TicketService] = None
github_secret: Optional[str] = None


def init_webhooks_controller(service: TicketService, gh_secret: str = None):
    """Inicializa el controller con el servicio"""
    global ticket_service, github_secret
    ticket_service = service
    github_secret = gh_secret


def verify_github_signature(payload: bytes, signature: str) -> bool:
    """
    Verifica la firma de GitHub Webhook.
    
    Args:
        payload: Body del request
        signature: Header X-Hub-Signature-256
    
    Returns:
        True si es válido, False si no
    """
    if not github_secret:
        return True  # Si no hay secret configurado, aceptar (solo dev)
    
    if not signature:
        return False
    
    # Calcular HMAC
    mac = hmac.new(
        github_secret.encode(),
        msg=payload,
        digestmod=hashlib.sha256
    )
    expected_signature = f"sha256={mac.hexdigest()}"
    
    return hmac.compare_digest(expected_signature, signature)


@webhooks_bp.route('/github', methods=['POST'])
def github_webhook():
    """
    Webhook de GitHub.
    
    Eventos soportados:
    - push: Git-Sync automático
    - pull_request: Mover tickets a review
    """
    # Verificar firma
    signature = request.headers.get('X-Hub-Signature-256')
    if not verify_github_signature(request.get_data(), signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event_type = request.headers.get('X-GitHub-Event')
    payload = request.get_json()
    
    try:
        if event_type == 'push':
            return handle_github_push(payload)
        
        elif event_type == 'pull_request':
            return handle_github_pull_request(payload)
        
        else:
            return jsonify({'message': f'Event {event_type} not handled'}), 200
    
    except Exception as e:
        print(f"Error processing GitHub webhook: {e}")
        return jsonify({'error': str(e)}), 500


def handle_github_push(payload: dict):
    """
    Maneja eventos de push de GitHub.
    Implementa el Git-Sync automático.
    """
    repo_name = payload['repository']['full_name']
    branch = payload['ref'].replace('refs/heads/', '')
    commits = payload['commits']
    
    processed_tickets = []
    
    for commit in commits:
        commit_hash = commit['id']
        author = commit['author']['username'] if 'username' in commit['author'] else commit['author']['name']
        message = commit['message']
        
        # Procesar el commit
        ticket = ticket_service.process_git_push(
            repo=repo_name,
            branch=branch,
            commit_hash=commit_hash,
            author=author,
            commit_message=message
        )
        
        if ticket:
            processed_tickets.append({
                'ticket_id': ticket.id,
                'status': ticket.status.value
            })
    
    return jsonify({
        'message': 'Push processed',
        'branch': branch,
        'commits_count': len(commits),
        'tickets_updated': processed_tickets
    }), 200


def handle_github_pull_request(payload: dict):
    """
    Maneja eventos de Pull Request.
    Mueve tickets a "In Review" automáticamente.
    """
    action = payload['action']
    pr = payload['pull_request']
    branch = pr['head']['ref']
    
    # Si se abre un PR, mover ticket a "In Review"
    if action == 'opened':
        # Buscar ticket asociado a la rama
        # TODO: Implementar búsqueda y movimiento
        pass
    
    return jsonify({
        'message': 'Pull request processed',
        'action': action,
        'branch': branch
    }), 200


@webhooks_bp.route('/slack', methods=['POST'])
def slack_webhook():
    """
    Webhook de Slack.
    
    Eventos soportados:
    - Mensajes en canales monitoreados
    - Comandos slash (ej: /ticket crear ...)
    """
    payload = request.get_json()
    
    # Verificar desafío de Slack (primera vez)
    if 'challenge' in payload:
        return jsonify({'challenge': payload['challenge']}), 200
    
    # Procesar evento
    event = payload.get('event', {})
    event_type = event.get('type')
    
    if event_type == 'message':
        return handle_slack_message(event)
    
    return jsonify({'message': 'Event processed'}), 200


def handle_slack_message(event: dict):
    """
    Maneja mensajes de Slack.
    Busca comandos del Copiloto.
    """
    text = event.get('text', '')
    user_id = event.get('user')
    channel = event.get('channel')
    
    # Detectar si es un comando de crear ticket
    if 'crear ticket' in text.lower() or '#ticket' in text:
        # TODO: Crear ticket usando IA
        # ticket = ticket_service.create_ticket_from_natural_language(...)
        pass
    
    return jsonify({'message': 'Message processed'}), 200


@webhooks_bp.route('/teams', methods=['POST'])
def teams_webhook():
    """
    Webhook de Microsoft Teams.
    Similar a Slack pero para Teams.
    """
    payload = request.get_json()
    
    # TODO: Implementar lógica de Teams
    
    return jsonify({'message': 'Teams webhook processed'}), 200


@webhooks_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'webhooks'}), 200
