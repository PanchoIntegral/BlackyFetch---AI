import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Ticket, TicketStatus } from '../../types';
import { TicketCard } from './TicketCard';
import { getStatusLabel } from '../../utils/helpers';

interface TicketBoardProps {
    tickets: Ticket[];
    onMoveTicket: (ticketId: string, newStatus: TicketStatus) => void;
    onTicketClick?: (ticket: Ticket) => void;
}

const COLUMNS: TicketStatus[] = [
    'backlog' as TicketStatus,
    'todo' as TicketStatus,
    'in_progress' as TicketStatus,
    'in_review' as TicketStatus,
    'done' as TicketStatus,
];

// Helper to get column header color
const getColumnColor = (status: TicketStatus) => {
    switch (status) {
        case 'backlog': return 'bg-gray-200 dark:bg-gray-700';
        case 'todo': return 'bg-blue-500';
        case 'in_progress': return 'bg-indigo-500';
        case 'in_review': return 'bg-yellow-500';
        case 'done': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
};

export const TicketBoard: React.FC<TicketBoardProps> = ({
    tickets,
    onMoveTicket,
    onTicketClick,
}) => {
    // Group tickets by status
    const ticketsByStatus = tickets.reduce((acc, ticket) => {
        if (!acc[ticket.status]) {
            acc[ticket.status] = [];
        }
        acc[ticket.status].push(ticket);
        return acc;
    }, {} as Record<TicketStatus, Ticket[]>);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as TicketStatus;
        onMoveTicket(draggableId, newStatus);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="h-full flex gap-6 overflow-x-auto pb-4 items-start">
                {COLUMNS.map((status) => {
                    const columnTickets = ticketsByStatus[status] || [];
                    const colorClass = getColumnColor(status);

                    return (
                        <div key={status} className="w-80 flex-shrink-0 flex flex-col max-h-full bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                            {/* Column Header */}
                            <div className="p-4 flex items-center justify-between sticky top-0 bg-inherit z-10 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                        {getStatusLabel(status)}
                                    </h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {columnTickets.length}
                                </span>
                            </div>

                            <Droppable droppableId={status}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-200 rounded-b-xl ${snapshot.isDraggingOver
                                            ? 'bg-primary-50/50 dark:bg-primary-900/10'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex flex-col gap-3">
                                            {columnTickets.map((ticket, index) => (
                                                <Draggable
                                                    key={ticket.id}
                                                    draggableId={ticket.id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                transform: snapshot.isDragging
                                                                    ? `${provided.draggableProps.style?.transform} rotate(2deg) scale(1.02)`
                                                                    : provided.draggableProps.style?.transform,
                                                            }}
                                                            className={`${snapshot.isDragging ? 'z-50 shadow-2xl ring-2 ring-primary-500/20' : ''}`}
                                                        >
                                                            <TicketCard
                                                                ticket={ticket}
                                                                onClick={() => onTicketClick?.(ticket)}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>

                                        {columnTickets.length === 0 && (
                                            <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                                No tickets
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};
