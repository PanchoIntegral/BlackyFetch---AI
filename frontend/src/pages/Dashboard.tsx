import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import {
    Ticket,
    TrendingUp,
    Zap,
    Clock,
    Sparkles,
    FileText,
    CheckCircle2,
    PlayCircle,
    Eye
} from 'lucide-react';

export const Dashboard: React.FC = () => {
    // TODO: Get project ID from context or URL params
    const PROJECT_ID = 'project-123';
    const { stats, activities, loading } = useDashboard(PROJECT_ID);

    const StatCard = ({
        title,
        value,
        subtext,
        icon: Icon,
        colorClass
    }: {
        title: string;
        value: string | number;
        subtext: string;
        icon: React.ElementType;
        colorClass: string;
    }) => (
        <div className="card-premium p-6 flex items-start justify-between relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">{subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} strokeWidth={1.5} />
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${colorClass} opacity-5 group-hover:scale-150 transition-transform duration-500`} />
        </div>
    );

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'ticket_created':
                return <FileText className="w-4 h-4" strokeWidth={1.5} />;
            case 'ticket_completed':
                return <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />;
            case 'ticket_started':
                return <PlayCircle className="w-4 h-4" strokeWidth={1.5} />;
            case 'ticket_review':
                return <Eye className="w-4 h-4" strokeWidth={1.5} />;
            default:
                return <FileText className="w-4 h-4" strokeWidth={1.5} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, get ready for the sprint.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary flex items-center gap-2">
                        <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                        Ask AI Copilot
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tickets"
                    value={stats?.total_tickets ?? 0}
                    subtext={stats?.new_tickets_today ? `+${stats.new_tickets_today} new today` : 'No new tickets'}
                    icon={Ticket}
                    colorClass="bg-blue-500"
                />
                <StatCard
                    title="Sprint Progress"
                    value={`${stats?.progress_percentage ?? 0}%`}
                    subtext={stats?.progress_percentage && stats.progress_percentage >= 50 ? 'On Track' : 'Keep going'}
                    icon={TrendingUp}
                    colorClass="bg-indigo-500"
                />
                <StatCard
                    title="Team Velocity"
                    value={stats?.sprint?.velocity ?? 0}
                    subtext="pts this sprint"
                    icon={Zap}
                    colorClass="bg-purple-500"
                />
                <StatCard
                    title="Time Remaining"
                    value={`${stats?.sprint?.days_remaining ?? 0}d`}
                    subtext={stats?.sprint?.end_date ? `Sprint ends ${stats.sprint.end_date}` : ''}
                    icon={Clock}
                    colorClass="bg-pink-500"
                />
            </div>

            {/* Recent Activity / Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart/Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-premium p-6 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sprint Burnup</h3>
                            <select className="input-field w-auto text-sm py-1">
                                <option>{stats?.sprint?.name || 'This Sprint'}</option>
                                <option>Last Sprint</option>
                            </select>
                        </div>

                        {/* Status Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.tickets_by_status?.backlog ?? 0}
                                </p>
                                <p className="text-xs text-gray-500">Backlog</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats?.tickets_by_status?.todo ?? 0}
                                </p>
                                <p className="text-xs text-gray-500">To Do</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {stats?.tickets_by_status?.in_progress ?? 0}
                                </p>
                                <p className="text-xs text-gray-500">In Progress</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats?.tickets_by_status?.in_review ?? 0}
                                </p>
                                <p className="text-xs text-gray-500">In Review</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats?.tickets_by_status?.done ?? 0}
                                </p>
                                <p className="text-xs text-gray-500">Done</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Overall Progress</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {stats?.completed_tickets ?? 0} / {stats?.total_tickets ?? 0} completed
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                                    style={{ width: `${stats?.progress_percentage ?? 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="space-y-6">
                    <div className="card-premium p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>

                        {activities.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-700">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="relative z-10 pl-10">
                                        <div className="absolute left-0 top-1 p-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-700 rounded-full">
                                            <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                <span className="text-primary-600 dark:text-primary-400">
                                                    {activity.user.username}
                                                </span>{' '}
                                                {activity.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.time_ago}</p>
                                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                                                {activity.ticket.title}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
                                <p className="text-sm">No recent activity</p>
                            </div>
                        )}

                        <button className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 font-medium transition-colors">
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
