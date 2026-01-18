import apiClient from './client';
import type { Project, ProjectMethodology } from '../types';

/**
 * Project API Types
 */
export interface CreateProjectRequest {
    name: string;
    description?: string;
    owner_id: string;
    github_repo?: string;
    slack_channel?: string;
    team_members?: string[];
    methodology?: ProjectMethodology;
    auto_move_enabled?: boolean;
    ai_assistant_enabled?: boolean;
}

export interface UpdateProjectRequest {
    user_id: string;
    name?: string;
    description?: string;
    github_repo?: string;
    slack_channel?: string;
    team_members?: string[];
    auto_move_enabled?: boolean;
    ai_assistant_enabled?: boolean;
}

export interface ProjectWithStats extends Project {
    is_invited?: boolean;
    progress: number;
    ticket_count: number;
    team_size: number;
}

export interface UserProjectsResponse {
    owned: ProjectWithStats[];
    invited: ProjectWithStats[];
    archived: ProjectWithStats[];
}

export interface ProjectStatsResponse {
    total_tickets: number;
    tickets_by_status: Record<string, number>;
    team_size: number;
    progress: number;
}

/**
 * Project API Service
 * All API calls related to projects
 */
export const projectApi = {
    /**
     * Get all projects for a user (owned, invited, archived)
     */
    getUserProjects: async (userId: string): Promise<UserProjectsResponse> => {
        return apiClient.get(`/api/projects/?user_id=${userId}`);
    },

    /**
     * Get a single project by ID
     */
    getProject: async (projectId: string): Promise<Project & { stats: ProjectStatsResponse }> => {
        return apiClient.get(`/api/projects/${projectId}`);
    },

    /**
     * Create a new project
     */
    createProject: async (data: CreateProjectRequest): Promise<Project> => {
        return apiClient.post('/api/projects/', data);
    },

    /**
     * Update a project
     */
    updateProject: async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
        return apiClient.put(`/api/projects/${projectId}`, data);
    },

    /**
     * Archive (soft delete) a project
     */
    archiveProject: async (projectId: string, userId: string): Promise<{ id: string; is_active: boolean; message: string }> => {
        return apiClient.delete(`/api/projects/${projectId}?user_id=${userId}`);
    },

    /**
     * Add a team member to a project
     */
    addTeamMember: async (projectId: string, userId: string, memberId: string): Promise<{ id: string; team_members: string[]; message: string }> => {
        return apiClient.post(`/api/projects/${projectId}/members`, {
            user_id: userId,
            member_id: memberId
        });
    },

    /**
     * Remove a team member from a project
     */
    removeTeamMember: async (projectId: string, userId: string, memberId: string): Promise<{ id: string; team_members: string[]; message: string }> => {
        return apiClient.delete(`/api/projects/${projectId}/members/${memberId}?user_id=${userId}`);
    },

    /**
     * Get project statistics
     */
    getProjectStats: async (projectId: string): Promise<ProjectStatsResponse> => {
        return apiClient.get(`/api/projects/${projectId}/stats`);
    },
};
