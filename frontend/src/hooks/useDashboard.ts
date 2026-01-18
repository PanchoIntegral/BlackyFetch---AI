import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard';
import type { DashboardStats, Activity } from '../api/dashboard';

interface UseDashboardReturn {
    stats: DashboardStats | null;
    activities: Activity[];
    loading: boolean;
    error: string | null;
    refreshStats: () => Promise<void>;
    refreshActivity: () => Promise<void>;
    refresh: () => Promise<void>;
}

export const useDashboard = (projectId: string): UseDashboardReturn => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshStats = useCallback(async () => {
        try {
            const data = await dashboardApi.getStats(projectId);
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stats');
            console.error('Error fetching dashboard stats:', err);
        }
    }, [projectId]);

    const refreshActivity = useCallback(async () => {
        try {
            const data = await dashboardApi.getActivity(projectId);
            setActivities(data.activities || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch activity');
            console.error('Error fetching dashboard activity:', err);
        }
    }, [projectId]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await Promise.all([refreshStats(), refreshActivity()]);
        setLoading(false);
    }, [refreshStats, refreshActivity]);

    useEffect(() => {
        if (projectId) {
            refresh();
        }
    }, [projectId, refresh]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
            refreshActivity();
        }, 30000);

        return () => clearInterval(interval);
    }, [refreshStats, refreshActivity]);

    return {
        stats,
        activities,
        loading,
        error,
        refreshStats,
        refreshActivity,
        refresh,
    };
};
