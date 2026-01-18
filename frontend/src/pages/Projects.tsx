import React, { useState } from 'react';
import { ProjectCard, NewProjectCard } from '../components/Project/ProjectCard';
import { CreateProjectModal } from '../components/Project/CreateProjectModal';
import type { ProjectFormData } from '../components/Project/CreateProjectModal';
import { Filter, Bot, Folder, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import type { ProjectWithStats } from '../api/projects';

type Tab = 'owned' | 'invited' | 'archived';

// Colores disponibles para proyectos
const PROJECT_COLORS = [
    'bg-cyan-500',
    'bg-orange-500',
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
];

// Función para obtener un color basado en el ID del proyecto
const getProjectColor = (projectId: string): string => {
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PROJECT_COLORS[hash % PROJECT_COLORS.length];
};

// Función para generar avatares de miembros del equipo
const generateTeamAvatars = (teamMembers: string[], ownerId?: string) => {
    const members = ownerId ? [ownerId, ...teamMembers] : teamMembers;
    return members.slice(0, 5).map((id, index) => ({
        id,
        avatar: `U${index + 1}`
    }));
};

export const Projects: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('owned');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    // Usar el hook de proyectos con el ID del usuario actual
    const userId = user?.id || 'dev-user-001';
    const { projects, loading, error, createProject, refresh } = useProjects(userId);

    // Mapear proyectos del API al formato del componente
    const mapProjectToCard = (project: ProjectWithStats) => ({
        id: project.id,
        title: project.name,
        description: project.description || '',
        progress: project.progress || 0,
        icon: project.ai_assistant_enabled ? <Bot className="w-4 h-4" /> : <Folder className="w-4 h-4" />,
        colorClass: getProjectColor(project.id),
        teamMembers: generateTeamAvatars(project.team_members, project.owner_id),
        taskCount: project.ticket_count || 0,
        ticketCount: project.ticket_count || 0,
        isInvited: project.is_invited || false,
    });

    // Filtrar proyectos por término de búsqueda
    const filterProjects = (projectList: ProjectWithStats[]) => {
        if (!searchTerm.trim()) return projectList;
        const term = searchTerm.toLowerCase();
        return projectList.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.description || '').toLowerCase().includes(term)
        );
    };

    const ownedProjects = filterProjects(projects.owned).map(mapProjectToCard);
    const invitedProjects = filterProjects(projects.invited).map(mapProjectToCard);
    const archivedProjects = filterProjects(projects.archived).map(mapProjectToCard);

    // Handler para crear proyecto
    const handleCreateProject = async (data: ProjectFormData) => {
        await createProject(data);
    };

    // Handler para navegar al board del proyecto
    const handleProjectClick = (projectId: string) => {
        navigate(`/board?project=${projectId}`);
    };

    return (
        <div className="space-y-8 animate-fade-in p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Projects Directory</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your boards, track progress, and collaborate with your team.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
                        title="Refrescar proyectos"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Filter/Search */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by name..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors shadow-sm w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={refresh}
                        className="ml-auto text-sm font-medium hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'owned'
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        <span className="text-lg">cmd</span> Owned Projects
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                            {projects.owned.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('invited')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invited'
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Invited Projects
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                            {projects.invited.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'archived'
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Archived
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                            {projects.archived.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Cargando proyectos...</span>
                    </div>
                </div>
            )}

            {/* Content */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'owned' && (
                        <>
                            {ownedProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    {...project}
                                    onClick={() => handleProjectClick(project.id)}
                                />
                            ))}
                            <NewProjectCard onClick={() => setIsModalOpen(true)} />
                        </>
                    )}

                    {activeTab === 'invited' && (
                        <>
                            {invitedProjects.length > 0 ? (
                                invitedProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        {...project}
                                        onClick={() => handleProjectClick(project.id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <p>No tienes proyectos como invitado.</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'archived' && (
                        <>
                            {archivedProjects.length > 0 ? (
                                archivedProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        {...project}
                                        onClick={() => handleProjectClick(project.id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <p>No archived projects found.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </div>
    );
};
