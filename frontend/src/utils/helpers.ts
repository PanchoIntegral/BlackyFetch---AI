import { TicketStatus, TicketPriority } from '../types';

/**
 * Get display name for ticket status
 */
export const getStatusLabel = (status: TicketStatus): string => {
    const labels: Record<TicketStatus, string> = {
        [TicketStatus.BACKLOG]: 'Backlog',
        [TicketStatus.TODO]: 'To Do',
        [TicketStatus.IN_PROGRESS]: 'In Progress',
        [TicketStatus.IN_REVIEW]: 'In Review',
        [TicketStatus.DONE]: 'Done',
        [TicketStatus.ARCHIVED]: 'Archived',
    };
    return labels[status];
};

/**
 * Get color for ticket priority
 */
export const getPriorityColor = (priority: TicketPriority): string => {
    const colors: Record<TicketPriority, string> = {
        [TicketPriority.LOW]: 'var(--priority-low)',
        [TicketPriority.MEDIUM]: 'var(--priority-medium)',
        [TicketPriority.HIGH]: 'var(--priority-high)',
        [TicketPriority.CRITICAL]: 'var(--priority-critical)',
    };
    return colors[priority];
};

/**
 * Get color for ticket status
 */
export const getStatusColor = (status: TicketStatus): string => {
    const colors: Record<TicketStatus, string> = {
        [TicketStatus.BACKLOG]: 'var(--status-backlog)',
        [TicketStatus.TODO]: 'var(--status-todo)',
        [TicketStatus.IN_PROGRESS]: 'var(--status-in-progress)',
        [TicketStatus.IN_REVIEW]: 'var(--status-in-review)',
        [TicketStatus.DONE]: 'var(--status-done)',
        [TicketStatus.ARCHIVED]: 'var(--status-archived)',
    };
    return colors[status];
};

/**
 * Format date to relative time
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString();
};

/**
 * Get initials from username
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
