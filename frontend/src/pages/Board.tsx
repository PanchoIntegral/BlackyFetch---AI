import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { useProject } from '../hooks/useProjects';
import { TicketBoard } from '../components/Ticket/TicketBoard';
import { AICopilot } from '../components/AI/AICopilot';
import { Loader2, AlertCircle, ArrowLeft, LayoutGrid, Repeat } from 'lucide-react';
import type { Ticket, TicketStatus } from '../types';

export const Board: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Obtener project ID de la URL
    const projectId = searchParams.get('project');

    // Cargar datos del proyecto
    const { project, loading: projectLoading, error: projectError } = useProject(projectId);

    // Cargar tickets del proyecto
    const { tickets, loading: ticketsLoading, error: ticketsError, moveTicket, fetchTickets } = useTickets(projectId || '');

    // Redirigir si no hay proyecto
    useEffect(() => {
        if (!projectId) {
            navigate('/projects');
        }
    }, [projectId, navigate]);

    const handleMoveTicket = async (ticketId: string, newStatus: TicketStatus) => {
        if (!user) return;
        await moveTicket(ticketId, newStatus, user.id);
    };

    const handleTicketClick = (ticket: Ticket) => {
        console.log('Clicked ticket:', ticket);
        // TODO: Abrir modal de detalles del ticket
    };

    const handleTicketCreated = () => {
        if (projectId) {
            fetchTickets(projectId);
        }
    };

    const handleBackToProjects = () => {
        navigate('/projects');
    };

    // Loading state
    if (projectLoading || ticketsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Cargando proyecto...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (projectError || ticketsError) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{projectError || ticketsError}</p>
                    <button
                        onClick={handleBackToProjects}
                        className="ml-auto text-sm font-medium hover:underline"
                    >
                        Volver a proyectos
                    </button>
                </div>
            </div>
        );
    }

    // No project found
    if (!project) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Proyecto no encontrado</p>
                    <button
                        onClick={handleBackToProjects}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Volver a proyectos
                    </button>
                </div>
            </div>
        );
    }

    // Calcular estadísticas
    const totalTickets = tickets.length;
    const doneTickets = tickets.filter(t => t.status === 'done').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;

    return (
        <div className="h-full flex flex-col space-y-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    {/* Back button */}
                    <button
                        onClick={handleBackToProjects}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Volver a proyectos"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.name}
                            </h1>
                            {/* Methodology badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                project.methodology === 'scrum'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                                {project.methodology === 'scrum' ? (
                                    <Repeat className="w-3 h-3" />
                                ) : (
                                    <LayoutGrid className="w-3 h-3" />
                                )}
                                {project.methodology === 'scrum' ? 'Scrum' : 'Kanban'}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {project.description || 'Sin descripción'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTickets}</p>
                            <p className="text-gray-500 dark:text-gray-400">Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{inProgressTickets}</p>
                            <p className="text-gray-500 dark:text-gray-400">En Progreso</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{doneTickets}</p>
                            <p className="text-gray-500 dark:text-gray-400">Completados</p>
                        </div>
                    </div>

                    {/* Team avatars */}
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300"
                            >
                                U{i}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 min-h-0">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No hay tickets aún
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                            Usa el AI Copilot en la esquina inferior derecha para crear tu primer ticket con lenguaje natural.
                        </p>
                    </div>
                ) : (
                    <TicketBoard
                        tickets={tickets}
                        onMoveTicket={handleMoveTicket}
                        onTicketClick={handleTicketClick}
                    />
                )}
            </div>

            {/* AI Copilot */}
            {project.ai_assistant_enabled && projectId && (
                <AICopilot projectId={projectId} onTicketCreated={handleTicketCreated} />
            )}
        </div>
    );
};
