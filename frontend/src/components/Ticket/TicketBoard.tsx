import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import type { Ticket, TicketStatus } from '../../types';
import { TicketCard } from './TicketCard';
import { CreateTicketModal } from './CreateTicketModal';
import { getStatusLabel } from '../../utils/helpers';

interface TicketBoardProps {
    tickets: Ticket[];
    onMoveTicket: (ticketId: string, newStatus: TicketStatus) => void;
    onTicketClick?: (ticket: Ticket) => void;
    onCreateTicket?: () => void;
    projectId: string;
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
    onCreateTicket,
    projectId,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('backlog');

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

    const handleOpenCreateModal = (status: TicketStatus) => {
        setSelectedStatus(status);
        setIsModalOpen(true);
    };

    const handleTicketCreated = () => {
        onCreateTicket?.();
    };

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="h-full flex gap-4 overflow-x-auto pb-4 items-start">
                    {COLUMNS.map((status) => {
                        const columnTickets = ticketsByStatus[status] || [];
                        const colorClass = getColumnColor(status);

                        return (
                            <div key={status} className="w-72 flex-shrink-0 flex flex-col max-h-full bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                {/* Column Header */}
                                <div className="p-3 flex items-center justify-between sticky top-0 bg-inherit z-10 rounded-t-xl">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                            {getStatusLabel(status)}
                                        </h3>
                                        <span className="px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                                            {columnTickets.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleOpenCreateModal(status)}
                                        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                                        title={`Crear ticket en ${getStatusLabel(status)}`}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 p-2 overflow-y-auto min-h-[200px] transition-colors duration-200 rounded-b-xl ${snapshot.isDraggingOver
                                                ? 'bg-primary-50/50 dark:bg-primary-900/10'
                                                : ''
                                                }`}
                                        >
                                            <div className="flex flex-col gap-2">
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
                                                <button
                                                    onClick={() => handleOpenCreateModal(status)}
                                                    className="w-full h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors cursor-pointer group"
                                                >
                                                    <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs">Crear ticket</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleTicketCreated}
                projectId={projectId}
                initialStatus={selectedStatus}
            />
        </>
    );
};
