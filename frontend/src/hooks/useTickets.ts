import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '../api/tickets';
import { socketService } from '../api/socket';
import type { Ticket, TicketStatus, CreateTicketRequest, CreateTicketWithAIRequest } from '../types';

interface UseTicketsReturn {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    fetchTickets: (projectId: string) => Promise<void>;
    createTicket: (data: CreateTicketRequest) => Promise<Ticket | null>;
    createTicketWithAI: (data: CreateTicketWithAIRequest) => Promise<Ticket | null>;
    moveTicket: (ticketId: string, newStatus: TicketStatus, userId: string) => Promise<void>;
    assignTicket: (ticketId: string, userId: string, assignedBy: string) => Promise<void>;
    updateTicketLocal: (updatedTicket: Ticket) => void;
}

export const useTickets = (projectId?: string): UseTicketsReturn => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch tickets for a project
    const fetchTickets = useCallback(async (pid: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ticketApi.getProjectTickets(pid);
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new ticket
    const createTicket = useCallback(async (data: CreateTicketRequest): Promise<Ticket | null> => {
        setError(null);
        try {
            const newTicket = await ticketApi.createTicket(data);
            setTickets((prev) => [...prev, newTicket]);
            return newTicket;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ticket');
            console.error('Error creating ticket:', err);
            return null;
        }
    }, []);

    // Create a ticket with AI
    const createTicketWithAI = useCallback(async (data: CreateTicketWithAIRequest): Promise<Ticket | null> => {
        setError(null);
        try {
            const newTicket = await ticketApi.createTicketWithAI(data);
            setTickets((prev) => [...prev, newTicket]);
            return newTicket;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ticket with AI');
            console.error('Error creating ticket with AI:', err);
            return null;
        }
    }, []);

    // Move a ticket to a new status
    const moveTicket = useCallback(async (ticketId: string, newStatus: TicketStatus, userId: string) => {
        setError(null);
        try {
            const updatedTicket = await ticketApi.moveTicket(ticketId, { new_status: newStatus, user_id: userId });
            setTickets((prev) =>
                prev.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to move ticket');
            console.error('Error moving ticket:', err);
        }
    }, []);

    // Assign a ticket to a user
    const assignTicket = useCallback(async (ticketId: string, userId: string, assignedBy: string) => {
        setError(null);
        try {
            const updatedTicket = await ticketApi.assignTicket(ticketId, {
                assigned_to: userId,
                assigned_by: assignedBy,
            });
            setTickets((prev) =>
                prev.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign ticket');
            console.error('Error assigning ticket:', err);
        }
    }, []);

    // Update ticket locally (for real-time updates)
    const updateTicketLocal = useCallback((updatedTicket: Ticket) => {
        setTickets((prev) => {
            const exists = prev.find((t) => t.id === updatedTicket.id);
            if (exists) {
                return prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t));
            } else {
                return [...prev, updatedTicket];
            }
        });
    }, []);

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribeCreated = socketService.onTicketCreated((data) => {
            if (data.ticket) {
                updateTicketLocal(data.ticket);
            }
        });

        const unsubscribeMoved = socketService.onTicketMoved((data) => {
            if (data.ticket) {
                updateTicketLocal(data.ticket);
            }
        });

        const unsubscribeAssigned = socketService.onTicketAssigned((data) => {
            if (data.ticket) {
                updateTicketLocal(data.ticket);
            }
        });

        return () => {
            unsubscribeCreated();
            unsubscribeMoved();
            unsubscribeAssigned();
        };
    }, [updateTicketLocal]);

    // Fetch tickets on mount if projectId is provided
    useEffect(() => {
        if (projectId) {
            fetchTickets(projectId);
        }
    }, [projectId, fetchTickets]);

    return {
        tickets,
        loading,
        error,
        fetchTickets,
        createTicket,
        createTicketWithAI,
        moveTicket,
        assignTicket,
        updateTicketLocal,
    };
};
