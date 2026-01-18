"""
BlackyFetch - OpenAI Adapter
Implementación del puerto de IA usando OpenAI API.
"""
from typing import Dict, Any, List, Optional
import openai
import json

from ...domain.models import Ticket, TicketPriority, TicketStatus
from ...domain.ports import IAIService


class OpenAIAdapter(IAIService):
    """
    Adaptador para OpenAI API.
    Implementa el puerto IAIService usando GPT-4.
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4-turbo-preview"):
        """
        Args:
            api_key: API Key de OpenAI
            model: Modelo a usar (default: gpt-4-turbo-preview)
        """
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model
    
    def parse_natural_language_to_ticket(
        self,
        message: str,
        context: Dict[str, Any] = None
    ) -> Ticket:
        """
        Convierte un mensaje natural en un ticket estructurado usando GPT-4.
        
        Args:
            message: Mensaje del usuario
            context: Contexto adicional
        
        Returns:
            Ticket con título, descripción y tags generados
        """
        context = context or {}
        
        # Construir prompt para GPT-4
        system_prompt = """
Eres un asistente de gestión de proyectos. Tu trabajo es convertir mensajes 
informales en tickets de trabajo estructurados.

Debes extraer:
1. Título claro y conciso (máx 100 caracteres)
2. Descripción detallada (ampliando la información del mensaje)
3. Tags relevantes (tecnologías, componentes, tipo de tarea)
4. Prioridad sugerida (low, medium, high, critical)

Responde SOLO con un JSON válido con esta estructura:
{
    "title": "string",
    "description": "string",
    "tags": ["tag1", "tag2"],
    "priority": "medium"
}
"""
        
        user_prompt = f"""
Mensaje del usuario: "{message}"

Contexto adicional:
- Proyecto: {context.get('project_name', 'No especificado')}
- Usuario: {context.get('user_name', 'No especificado')}
- Canal/Fuente: {context.get('source', 'No especificado')}

Convierte este mensaje en un ticket estructurado.
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            # Parsear respuesta
            result = json.loads(response.choices[0].message.content)
            
            # Crear ticket
            ticket = Ticket(
                title=result.get('title', message[:100]),
                description=result.get('description', message),
                tags=result.get('tags', []),
                priority=TicketPriority[result.get('priority', 'medium').upper()],
                ai_generated=True,
                original_message=message
            )
            
            return ticket
            
        except Exception as e:
            # Fallback: Si la IA falla, crear ticket básico
            return Ticket(
                title=message[:100] if len(message) > 100 else message,
                description=message,
                tags=['ai-generation-failed'],
                priority=TicketPriority.MEDIUM,
                ai_generated=True,
                original_message=message
            )
    
    def suggest_tags(self, ticket: Ticket) -> List[str]:
        """
        Sugiere tags para un ticket usando IA.
        
        Args:
            ticket: Ticket para analizar
        
        Returns:
            Lista de tags sugeridos
        """
        prompt = f"""
Analiza este ticket y sugiere 3-5 tags relevantes (tecnologías, componentes, tipo):

Título: {ticket.title}
Descripción: {ticket.description}

Responde SOLO con un array JSON de strings: ["tag1", "tag2", ...]
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get('tags', [])
            
        except Exception:
            return []
    
    def estimate_complexity(self, ticket: Ticket) -> float:
        """
        Estima las horas necesarias para completar un ticket.
        
        Args:
            ticket: Ticket para estimar
        
        Returns:
            Estimación en horas
        """
        prompt = f"""
Estima cuántas horas tomará completar esta tarea:

Título: {ticket.title}
Descripción: {ticket.description}
Tags: {', '.join(ticket.tags)}

Responde SOLO con un JSON: {{"hours": 5.0}}
Considera: desarrollo, testing, code review.
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return float(result.get('hours', 4.0))
            
        except Exception:
            return 4.0  # Default: 4 horas
    
    def analyze_sentiment(self, message: str) -> Dict[str, Any]:
        """
        Analiza el sentimiento de un mensaje para determinar urgencia.
        
        Args:
            message: Mensaje a analizar
        
        Returns:
            Diccionario con análisis de sentimiento
        """
        prompt = f"""
Analiza el sentimiento y urgencia de este mensaje:

"{message}"

Responde con JSON: 
{{
    "urgency": "low|medium|high|critical",
    "sentiment": "positive|neutral|negative",
    "confidence": 0.0-1.0
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception:
            return {
                "urgency": "medium",
                "sentiment": "neutral",
                "confidence": 0.5
            }


class MockAIAdapter(IAIService):
    """
    Mock adapter para desarrollo/testing sin usar la API real.
    """
    
    def parse_natural_language_to_ticket(
        self,
        message: str,
        context: Dict[str, Any] = None
    ) -> Ticket:
        """Implementación mock simple"""
        return Ticket(
            title=f"[MOCK] {message[:50]}",
            description=f"Ticket generado desde mensaje: {message}",
            tags=['mock', 'ai-generated'],
            priority=TicketPriority.MEDIUM,
            ai_generated=True,
            original_message=message
        )
    
    def suggest_tags(self, ticket: Ticket) -> List[str]:
        return ['bug', 'frontend', 'mock']
    
    def estimate_complexity(self, ticket: Ticket) -> float:
        return 3.0
    
    def analyze_sentiment(self, message: str) -> Dict[str, Any]:
        return {
            "urgency": "medium",
            "sentiment": "neutral",
            "confidence": 0.8
        }
