import { useState, useEffect, useCallback } from 'react';
import { projectApi } from '../api/projects';
import type { ProjectWithStats, UserProjectsResponse, CreateProjectRequest, UpdateProjectRequest } from '../api/projects';

interface UseProjectsResult {
    projects: UserProjectsResponse;
    loading: boolean;
    error: string | null;
    createProject: (data: Omit<CreateProjectRequest, 'owner_id'>) => Promise<void>;
    updateProject: (projectId: string, data: Omit<UpdateProjectRequest, 'user_id'>) => Promise<void>;
    archiveProject: (projectId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Hook para gestionar proyectos del usuario
 */
export function useProjects(userId: string): UseProjectsResult {
    const [projects, setProjects] = useState<UserProjectsResponse>({
        owned: [],
        invited: [],
        archived: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await projectApi.getUserProjects(userId);
            setProjects(data);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar proyectos');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const createProject = useCallback(async (data: Omit<CreateProjectRequest, 'owner_id'>) => {
        try {
            setError(null);
            await projectApi.createProject({
                ...data,
                owner_id: userId
            });
            // Refrescar la lista después de crear
            await fetchProjects();
        } catch (err) {
            console.error('Error creating project:', err);
            const message = err instanceof Error ? err.message : 'Error al crear proyecto';
            setError(message);
            throw new Error(message);
        }
    }, [userId, fetchProjects]);

    const updateProject = useCallback(async (projectId: string, data: Omit<UpdateProjectRequest, 'user_id'>) => {
        try {
            setError(null);
            await projectApi.updateProject(projectId, {
                ...data,
                user_id: userId
            });
            await fetchProjects();
        } catch (err) {
            console.error('Error updating project:', err);
            const message = err instanceof Error ? err.message : 'Error al actualizar proyecto';
            setError(message);
            throw new Error(message);
        }
    }, [userId, fetchProjects]);

    const archiveProject = useCallback(async (projectId: string) => {
        try {
            console.log('useProjects: archiving project', projectId, 'userId:', userId);
            setError(null);
            await projectApi.archiveProject(projectId, userId);
            console.log('useProjects: archived, refreshing...');
            // Refrescar la lista después de archivar
            await fetchProjects();
        } catch (err) {
            console.error('Error archiving project:', err);
            const message = err instanceof Error ? err.message : 'Error al archivar proyecto';
            setError(message);
            throw new Error(message);
        }
    }, [userId, fetchProjects]);

    return {
        projects,
        loading,
        error,
        createProject,
        updateProject,
        archiveProject,
        refresh: fetchProjects
    };
}

/**
 * Hook para obtener un proyecto específico
 */
export function useProject(projectId: string | null) {
    const [project, setProject] = useState<ProjectWithStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProject = useCallback(async () => {
        if (!projectId) {
            setProject(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await projectApi.getProject(projectId);
            setProject({
                ...data,
                progress: data.stats?.progress || 0,
                ticket_count: data.stats?.total_tickets || 0,
                team_size: data.stats?.team_size || 1
            });
        } catch (err) {
            console.error('Error fetching project:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar proyecto');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    return {
        project,
        loading,
        error,
        refresh: fetchProject
    };
}
