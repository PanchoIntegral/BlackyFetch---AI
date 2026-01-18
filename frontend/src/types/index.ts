// ============================================================================
// Domain Types - Matching Backend Models
// ============================================================================

export const TicketStatus = {
    BACKLOG: 'backlog',
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    DONE: 'done',
    ARCHIVED: 'archived',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const UserRole = {
    ADMIN: 'admin',
    BUILDER: 'builder',
    STAKEHOLDER: 'stakeholder',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    github_username?: string;
    slack_id?: string;
    created_at: string;
    is_active: boolean;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    created_by?: string;
    assigned_to?: string;
    project_id?: string;
    related_git_branches: string[];
    related_git_authors: string[];
    related_commits: string[];
    tags: string[];
    estimated_hours?: number;
    created_at: string;
    updated_at: string;
    ai_generated: boolean;
    original_message?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    github_repo?: string;
    slack_channel?: string;
    owner_id?: string;
    team_members: string[];
    auto_move_enabled: boolean;
    ai_assistant_enabled: boolean;
    created_at: string;
    is_active: boolean;
}

export interface Comment {
    id: string;
    ticket_id: string;
    user_id: string;
    content: string;
    created_at: string;
    edited_at?: string;
    is_system_message: boolean;
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateTicketRequest {
    title: string;
    description: string;
    project_id: string;
    created_by: string;
    priority?: TicketPriority;
    assigned_to?: string;
}

export interface CreateTicketWithAIRequest {
    message: string;
    project_id: string;
    created_by: string;
    context?: {
        source?: string;
        channel?: string;
    };
}

export interface MoveTicketRequest {
    new_status: TicketStatus;
    user_id: string;
}

export interface AssignTicketRequest {
    assigned_to: string;
    assigned_by: string;
}

// ============================================================================
// UI Types
// ============================================================================

export interface TicketsByStatus {
    [TicketStatus.BACKLOG]: Ticket[];
    [TicketStatus.TODO]: Ticket[];
    [TicketStatus.IN_PROGRESS]: Ticket[];
    [TicketStatus.IN_REVIEW]: Ticket[];
    [TicketStatus.DONE]: Ticket[];
    [TicketStatus.ARCHIVED]: Ticket[];
}

export interface NotificationData {
    type: 'ticket:created' | 'ticket:moved' | 'ticket:assigned' | 'ticket:updated';
    ticket: Ticket;
    message: string;
}
