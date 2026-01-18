import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { TicketBoard } from '../components/Ticket/TicketBoard';
import { AICopilot } from '../components/AI/AICopilot';
import type { Ticket, TicketStatus } from '../types';

// Mock project ID 
const MOCK_PROJECT_ID = 'project-123';

export const Board: React.FC = () => {
    const { user } = useAuth();
    const { tickets, loading, error, moveTicket, fetchTickets } = useTickets(MOCK_PROJECT_ID);


    const handleMoveTicket = async (ticketId: string, newStatus: TicketStatus) => {
        if (!user) return;
        await moveTicket(ticketId, newStatus, user.id);
    };

    const handleTicketClick = (ticket: Ticket) => {
        console.log('Clicked ticket:', ticket);
    };

    const handleTicketCreated = () => {
        fetchTickets(MOCK_PROJECT_ID);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <p>❌ {error}</p>
                <button
                    onClick={() => fetchTickets(MOCK_PROJECT_ID)}
                    className="mt-2 px-3 py-1 bg-white border border-red-200 rounded-md hover:bg-red-50"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint 24 Board</h1>
                    <p className="text-gray-500 dark:text-gray-400">12 Days Remaining</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-bg bg-gray-200" />
                        ))}
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        <span>+</span> New Task
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <TicketBoard
                    tickets={tickets}
                    onMoveTicket={handleMoveTicket}
                    onTicketClick={handleTicketClick}
                />
            </div>

            <AICopilot projectId={MOCK_PROJECT_ID} onTicketCreated={handleTicketCreated} />
        </div>
    );
};
