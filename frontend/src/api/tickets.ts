import apiClient from './client';
import type {
    Ticket,
    CreateTicketRequest,
    CreateTicketWithAIRequest,
    MoveTicketRequest,
    AssignTicketRequest,
} from '../types';

/**
 * Ticket API Service
 * All API calls related to tickets
 */
export const ticketApi = {
    /**
     * Get all tickets for a project
     */
    getProjectTickets: async (projectId: string): Promise<Ticket[]> => {
        const response: any = await apiClient.get(`/api/tickets/project/${projectId}`);
        return response.tickets || [];
    },

    /**
     * Get a single ticket by ID
     */
    getTicket: async (ticketId: string): Promise<Ticket> => {
        return apiClient.get(`/api/tickets/${ticketId}`);
    },

    /**
     * Create a new ticket manually
     */
    createTicket: async (data: CreateTicketRequest): Promise<Ticket> => {
        return apiClient.post('/api/tickets/', data);
    },

    /**
     * Create a ticket using AI (Copilot)
     */
    createTicketWithAI: async (data: CreateTicketWithAIRequest): Promise<Ticket> => {
        return apiClient.post('/api/tickets/ai', data);
    },

    /**
     * Move a ticket to a new status
     */
    moveTicket: async (ticketId: string, data: MoveTicketRequest): Promise<Ticket> => {
        return apiClient.patch(`/api/tickets/${ticketId}/move`, data);
    },

    /**
     * Assign a ticket to a user
     */
    assignTicket: async (ticketId: string, data: AssignTicketRequest): Promise<Ticket> => {
        return apiClient.patch(`/api/tickets/${ticketId}/assign`, data);
    },

    /**
     * Update a ticket
     */
    updateTicket: async (ticketId: string, data: Partial<Ticket>): Promise<Ticket> => {
        return apiClient.patch(`/api/tickets/${ticketId}`, data);
    },

    /**
     * Delete a ticket
     */
    deleteTicket: async (ticketId: string): Promise<void> => {
        return apiClient.delete(`/api/tickets/${ticketId}`);
    },
};
