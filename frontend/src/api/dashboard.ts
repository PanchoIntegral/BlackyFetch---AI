import apiClient from './client';

export interface DashboardStats {
    total_tickets: number;
    completed_tickets: number;
    in_progress_tickets: number;
    in_review_tickets: number;
    progress_percentage: number;
    tickets_by_status: {
        backlog: number;
        todo: number;
        in_progress: number;
        in_review: number;
        done: number;
        archived: number;
    };
    new_tickets_today: number;
    sprint: {
        name: string;
        days_remaining: number;
        end_date: string;
        velocity: number;
    };
}

export interface Activity {
    id: string;
    type: 'ticket_created' | 'ticket_updated' | 'ticket_completed' | 'ticket_started' | 'ticket_review';
    user: {
        id: string;
        username: string;
    };
    ticket: {
        id: string;
        title: string;
    };
    message: string;
    time_ago: string;
    created_at: string;
}

export interface ActivityResponse {
    activities: Activity[];
}

/**
 * Dashboard API Service
 */
export const dashboardApi = {
    /**
     * Get dashboard statistics for a project
     */
    getStats: async (projectId: string): Promise<DashboardStats> => {
        return apiClient.get(`/api/dashboard/stats/${projectId}`);
    },

    /**
     * Get recent activity for a project
     */
    getActivity: async (projectId: string): Promise<ActivityResponse> => {
        return apiClient.get(`/api/dashboard/activity/${projectId}`);
    },
};
