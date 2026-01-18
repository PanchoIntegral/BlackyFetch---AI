"""
BlackyFetch - Scripts de inicialización
Script para crear datos de ejemplo y configurar el sistema.
"""
import sys
sys.path.insert(0, '.')

from app import create_app
from src.infrastructure.adapters import DatabaseFactory
from src.domain.models import User, Project, UserRole
from config import get_config


def init_database():
    """Crea las tablas de la base de datos"""
    config = get_config()
    db_factory = DatabaseFactory(config.SQLALCHEMY_DATABASE_URI)
    
    print("🗄️  Creando tablas de base de datos...")
    db_factory.create_tables()
    print("✅ Tablas creadas exitosamente")


def create_sample_data():
    """Crea datos de ejemplo para desarrollo"""
    config = get_config()
    db_factory = DatabaseFactory(config.SQLALCHEMY_DATABASE_URI)
    
    user_repo = db_factory.get_user_repository()
    project_repo = db_factory.get_project_repository()
    
    print("👤 Creando usuarios de ejemplo...")
    
    # Crear usuarios
    admin = User(
        email="admin@blackyfetch.com",
        username="admin",
        role=UserRole.ADMIN,
        github_username="admin_gh"
    )
    admin = user_repo.create(admin)
    print(f"   ✓ Admin creado: {admin.email}")
    
    developer = User(
        email="dev@blackyfetch.com",
        username="developer",
        role=UserRole.BUILDER,
        github_username="dev_gh"
    )
    developer = user_repo.create(developer)
    print(f"   ✓ Developer creado: {developer.email}")
    
    stakeholder = User(
        email="stakeholder@blackyfetch.com",
        username="stakeholder",
        role=UserRole.STAKEHOLDER
    )
    stakeholder = user_repo.create(stakeholder)
    print(f"   ✓ Stakeholder creado: {stakeholder.email}")
    
    print("\n📁 Creando proyecto de ejemplo...")
    
    # Crear proyecto
    project = Project(
        name="BlackyFetch Demo",
        description="Proyecto de demostración del sistema",
        github_repo="blackyfetch/demo",
        slack_channel="#blackyfetch-demo",
        owner_id=admin.id,
        team_members=[admin.id, developer.id, stakeholder.id],
        auto_move_enabled=True,
        ai_assistant_enabled=True
    )
    project = project_repo.create(project)
    print(f"   ✓ Proyecto creado: {project.name} (ID: {project.id})")
    
    print("\n" + "=" * 60)
    print("✅ Datos de ejemplo creados exitosamente")
    print("=" * 60)
    print(f"\n📝 Información útil:")
    print(f"   Admin ID: {admin.id}")
    print(f"   Developer ID: {developer.id}")
    print(f"   Project ID: {project.id}")
    print(f"\n💡 Puedes usar estos IDs en los requests de la API")


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 BlackyFetch - Inicialización")
    print("=" * 60)
    
    init_database()
    print()
    create_sample_data()
    
    print("\n✨ Sistema listo para usar!")
    print("   Inicia el servidor con: python app.py")
