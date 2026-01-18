"""
BlackyFetch - Git Service Adapter
Implementación del puerto de Git para GitHub.
"""
from typing import Dict, Any, Optional
import re
import requests

from ...domain.ports import IGitService


class GitHubAdapter(IGitService):
    """
    Adaptador para GitHub API.
    Implementa el puerto IGitService.
    """
    
    def __init__(self, token: Optional[str] = None):
        """
        Args:
            token: GitHub Personal Access Token (opcional)
        """
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {}
        
        if token:
            self.headers["Authorization"] = f"Bearer {token}"
            self.headers["Accept"] = "application/vnd.github.v3+json"
    
    def get_commit_info(self, repo: str, commit_hash: str) -> Dict[str, Any]:
        """
        Obtiene información de un commit.
        
        Args:
            repo: Repositorio en formato "owner/repo"
            commit_hash: Hash del commit
        
        Returns:
            Información del commit
        """
        url = f"{self.base_url}/repos/{repo}/commits/{commit_hash}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                'hash': data['sha'],
                'message': data['commit']['message'],
                'author': data['commit']['author']['name'],
                'author_email': data['commit']['author']['email'],
                'date': data['commit']['author']['date'],
                'url': data['html_url']
            }
        except Exception as e:
            print(f"Error fetching commit {commit_hash}: {e}")
            return {}
    
    def get_branch_info(self, repo: str, branch_name: str) -> Dict[str, Any]:
        """
        Obtiene información de una rama.
        
        Args:
            repo: Repositorio en formato "owner/repo"
            branch_name: Nombre de la rama
        
        Returns:
            Información de la rama
        """
        url = f"{self.base_url}/repos/{repo}/branches/{branch_name}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                'name': data['name'],
                'commit_sha': data['commit']['sha'],
                'protected': data['protected']
            }
        except Exception as e:
            print(f"Error fetching branch {branch_name}: {e}")
            return {}
    
    def extract_ticket_id_from_branch(self, branch_name: str) -> Optional[str]:
        """
        Extrae el ID del ticket desde el nombre de la rama.
        
        Soporta formatos:
        - feature/BF-123-description
        - bugfix/BF-456
        - BF-789-hotfix
        
        Args:
            branch_name: Nombre de la rama
        
        Returns:
            ID del ticket o None
        """
        # Patrón: BF-123 (case insensitive)
        pattern = r'(BF-\d+)'
        match = re.search(pattern, branch_name, re.IGNORECASE)
        
        if match:
            return match.group(1).upper()
        
        return None


class MockGitAdapter(IGitService):
    """Mock adapter para testing sin acceso a GitHub"""
    
    def get_commit_info(self, repo: str, commit_hash: str) -> Dict[str, Any]:
        return {
            'hash': commit_hash,
            'message': 'Mock commit message',
            'author': 'mockuser',
            'author_email': 'mock@example.com',
            'date': '2024-01-01T00:00:00Z',
            'url': f'https://github.com/{repo}/commit/{commit_hash}'
        }
    
    def get_branch_info(self, repo: str, branch_name: str) -> Dict[str, Any]:
        return {
            'name': branch_name,
            'commit_sha': 'abc123',
            'protected': False
        }
    
    def extract_ticket_id_from_branch(self, branch_name: str) -> Optional[str]:
        pattern = r'(BF-\d+)'
        match = re.search(pattern, branch_name, re.IGNORECASE)
        return match.group(1).upper() if match else None
