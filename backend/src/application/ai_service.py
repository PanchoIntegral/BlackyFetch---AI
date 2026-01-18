"""
BlackyFetch - AI Service
Casos de uso relacionados con la Inteligencia Artificial.
El "Copiloto Activo" del sistema.
"""
from typing import Dict, Any, List, Optional
import re

from ..domain.models import Ticket, TicketPriority, TicketStatus
from ..domain.ports import IAIService


class AIService:
    """
    Servicio de aplicación para IA.
    Implementa la lógica de procesamiento de lenguaje natural.
    """
    
    def __init__(self, ai_port: IAIService):
        """
        Args:
            ai_port: Implementación del puerto de IA (ej: OpenAI)
        """
        self.ai_port = ai_port
    
    def create_ticket_from_message(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Ticket:
        """
        Caso de uso: Convertir mensaje natural en ticket estructurado.
        
        Ejemplos de mensajes:
        - "Hay que arreglar el login en mobile"
        - "El botón de guardar no funciona en Safari"
        - "Necesitamos agregar autenticación con Google"
        
        Args:
            message: Mensaje en lenguaje natural
            context: Contexto adicional (usuario, proyecto, etc.)
        
        Returns:
            Ticket estructurado con título, descripción y tags
        """
        return self.ai_port.parse_natural_language_to_ticket(message, context)
    
    def enrich_ticket(self, ticket: Ticket) -> Ticket:
        """
        Caso de uso: Enriquecer un ticket con información generada por IA.
        
        - Sugiere tags relevantes
        - Estima complejidad/horas
        - Mejora la descripción
        
        Args:
            ticket: Ticket a enriquecer
        
        Returns:
            Ticket enriquecido
        """
        # Sugerir tags si no tiene
        if not ticket.tags:
            ticket.tags = self.ai_port.suggest_tags(ticket)
        
        # Estimar complejidad si no está estimado
        if ticket.estimated_hours is None:
            ticket.estimated_hours = self.ai_port.estimate_complexity(ticket)
        
        return ticket
    
    def analyze_message_urgency(self, message: str) -> TicketPriority:
        """
        Caso de uso: Analizar la urgencia de un mensaje para priorización.
        
        Detecta palabras clave como:
        - "urgente", "crítico", "ahora" -> CRITICAL
        - "importante", "pronto" -> HIGH
        - "cuando puedas", "no urgente" -> LOW
        
        Args:
            message: Mensaje a analizar
        
        Returns:
            Prioridad sugerida
        """
        sentiment = self.ai_port.analyze_sentiment(message)
        
        # Análisis simple basado en palabras clave
        message_lower = message.lower()
        
        urgent_keywords = ['urgente', 'crítico', 'ahora', 'ya', 'emergencia', 'critical', 'urgent']
        high_keywords = ['importante', 'pronto', 'prioritario', 'important']
        low_keywords = ['cuando puedas', 'no urgente', 'low priority']
        
        if any(keyword in message_lower for keyword in urgent_keywords):
            return TicketPriority.CRITICAL
        elif any(keyword in message_lower for keyword in high_keywords):
            return TicketPriority.HIGH
        elif any(keyword in message_lower for keyword in low_keywords):
            return TicketPriority.LOW
        
        # Default: Medium
        return TicketPriority.MEDIUM
    
    def extract_ticket_id_from_text(self, text: str, project_prefix: str = "BF") -> Optional[str]:
        """
        Extrae el ID de un ticket desde texto.
        
        Ejemplos:
        - "feature/BF-123-login-fix" -> "BF-123"
        - "Fixes #BF-456" -> "BF-456"
        - "BF-789: Agregar validación" -> "BF-789"
        
        Args:
            text: Texto donde buscar
            project_prefix: Prefijo del proyecto (default: BF = BlackyFetch)
        
        Returns:
            ID del ticket si se encontró, None si no
        """
        # Patrón: BF-123 o #BF-123
        pattern = rf'#?{project_prefix}-(\d+)'
        match = re.search(pattern, text, re.IGNORECASE)
        
        if match:
            return f"{project_prefix}-{match.group(1)}"
        
        return None
    
    def generate_ticket_summary(self, ticket: Ticket) -> str:
        """
        Genera un resumen corto del ticket para notificaciones.
        
        Args:
            ticket: Ticket a resumir
        
        Returns:
            Resumen corto (máx 100 caracteres)
        """
        summary = f"[{ticket.priority.value.upper()}] {ticket.title}"
        if len(summary) > 100:
            summary = summary[:97] + "..."
        return summary


class SmartPermissionsService:
    """
    Servicio para lógica avanzada de Smart Permissions.
    Determina permisos dinámicos basados en contexto.
    """
    
    def __init__(self):
        pass
    
    def can_user_edit_ticket(self, user_id: str, ticket: Ticket, git_context: Optional[Dict] = None) -> bool:
        """
        Determina si un usuario puede editar un ticket basándose en contexto.
        
        Esta es una de las innovaciones clave del sistema:
        - Si el usuario es autor de commits relacionados -> Puede editar
        - Si el usuario está en la rama relacionada -> Puede editar
        - Si es el asignado o creador -> Puede editar
        
        Args:
            user_id: ID del usuario
            ticket: Ticket a verificar
            git_context: Contexto adicional de Git
        
        Returns:
            True si puede editar, False si no
        """
        # Esta lógica ya está en User.can_edit_ticket()
        # Aquí podemos agregar lógica más compleja basada en git_context
        
        if git_context:
            # Si el usuario hizo un commit reciente en la rama del ticket
            recent_authors = git_context.get('recent_authors', [])
            if user_id in recent_authors:
                return True
        
        return False
    
    def get_suggested_assignee(self, ticket: Ticket) -> Optional[str]:
        """
        Sugiere un asignado basándose en actividad de Git.
        
        Args:
            ticket: Ticket para analizar
        
        Returns:
            ID del usuario sugerido o None
        """
        # Si hay actividad de Git, sugerir al autor más activo
        if ticket.related_git_authors:
            # El primer autor (más reciente) es el sugerido
            return ticket.related_git_authors[0]
        
        return None
