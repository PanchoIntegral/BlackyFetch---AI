"""
BlackyFetch - SocketIO Adapter
Implementación del Event Bus y Notificaciones usando SocketIO.
"""
from typing import Dict, Any, Callable
from flask_socketio import SocketIO, emit
import json

from ...domain.models import Ticket, User
from ...domain.ports import IEventBus, INotificationService



class test  ():
    def __init__(self):
        pass

    def hello(self):
        return "hello"

class SocketIOEventBus(IEventBus):
    """
    Implementación del Event Bus usando SocketIO.
    Permite comunicación en tiempo real con el frontend.
    """
    
    def __init__(self, socketio: SocketIO):
        self.socketio = socketio
        self.subscribers: Dict[str, list] = {}
    
    def publish(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Publica un evento tanto localmente como via SocketIO.
        
        Args:
            event_type: Tipo de evento ("ticket.created", etc.)
            data: Datos del evento
        """
        # Emitir via SocketIO al frontend
        self.socketio.emit(event_type, data, namespace='/')
        
        # Llamar a subscribers locales (para workflows internos)
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                try:
                    callback(data)
                except Exception as e:
                    print(f"Error in subscriber for {event_type}: {e}")
    
    def subscribe(self, event_type: str, callback: Callable) -> None:
        """
        Suscribe un handler a un tipo de evento.
        
        Args:
            event_type: Tipo de evento
            callback: Función a ejecutar
        """
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)


class SocketIONotificationService(INotificationService):
    """
    Servicio de notificaciones en tiempo real usando SocketIO.
    """

    def __init__(self, socketio: SocketIO):
        self.socketio = socketio

    def send(self, user_id: str, message: str, notification_type: str = "info") -> None:
        """
        Envía una notificación genérica a un usuario.

        Args:
            user_id: ID del usuario destino
            message: Mensaje de la notificación
            notification_type: Tipo de notificación
        """
        self.socketio.emit('notification', {
            'type': notification_type,
            'title': 'Notificación',
            'message': message,
            'user_id': user_id
        }, namespace='/')

    def notify_ticket_created(self, ticket: Ticket) -> None:
        """
        Notifica la creación de un ticket.
        
        Args:
            ticket: Ticket creado
        """
        self.socketio.emit('notification', {
            'type': 'ticket_created',
            'title': 'Nuevo Ticket',
            'message': f'"{ticket.title}" ha sido creado',
            'ticket_id': ticket.id,
            'project_id': ticket.project_id
        }, namespace='/')
    
    def notify_ticket_moved(
        self,
        ticket: Ticket,
        old_status: str,
        new_status: str
    ) -> None:
        """
        Notifica el movimiento de un ticket.
        
        Args:
            ticket: Ticket movido
            old_status: Estado anterior
            new_status: Nuevo estado
        """
        self.socketio.emit('notification', {
            'type': 'ticket_moved',
            'title': 'Ticket Movido',
            'message': f'"{ticket.title}" movido de {old_status} a {new_status}',
            'ticket_id': ticket.id,
            'old_status': old_status,
            'new_status': new_status,
            'project_id': ticket.project_id
        }, namespace='/')
        
        # También emitir evento específico para actualizar el tablero
        self.socketio.emit('ticket:moved', {
            'ticket_id': ticket.id,
            'old_status': old_status,
            'new_status': new_status,
            'updated_at': ticket.updated_at.isoformat()
        }, namespace='/')
    
    def notify_ticket_assigned(self, ticket: Ticket, user: User) -> None:
        """
        Notifica la asignación de un ticket.
        
        Args:
            ticket: Ticket asignado
            user: Usuario asignado
        """
        self.socketio.emit('notification', {
            'type': 'ticket_assigned',
            'title': 'Ticket Asignado',
            'message': f'"{ticket.title}" asignado a {user.username}',
            'ticket_id': ticket.id,
            'user_id': user.id,
            'username': user.username,
            'project_id': ticket.project_id
        }, namespace='/')


class RedisEventBus(IEventBus):
    """
    Implementación del Event Bus usando Redis Pub/Sub.
    Útil para escalar horizontalmente con múltiples workers.
    """
    
    def __init__(self, redis_client):
        """
        Args:
            redis_client: Cliente de Redis
        """
        self.redis = redis_client
        self.subscribers: Dict[str, list] = {}
    
    def publish(self, event_type: str, data: Dict[str, Any]) -> None:
        """Publica un evento en Redis"""
        message = json.dumps({
            'type': event_type,
            'data': data
        })
        self.redis.publish('blackyfetch:events', message)
    
    def subscribe(self, event_type: str, callback: Callable) -> None:
        """Suscribe a eventos de Redis"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
        
        # TODO: Implementar Redis Pub/Sub listener
        # Esto requeriría un worker separado escuchando mensajes
    
    def _handle_message(self, message):
        """Handler interno para mensajes de Redis"""
        try:
            data = json.loads(message['data'])
            event_type = data['type']
            event_data = data['data']
            
            if event_type in self.subscribers:
                for callback in self.subscribers[event_type]:
                    callback(event_data)
        except Exception as e:
            print(f"Error handling Redis message: {e}")
