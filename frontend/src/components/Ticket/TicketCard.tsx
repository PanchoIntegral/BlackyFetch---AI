import React from 'react';
import type { Ticket, TicketPriority } from '../../types';
import { formatRelativeTime, getInitials } from '../../utils/helpers';

interface TicketCardProps {
    ticket: Ticket;
    onClick?: () => void;
}

const getPriorityStyles = (priority: TicketPriority) => {
    switch (priority) {
        case 'critical': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case 'high': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
        case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
    return (
        <div
            className="group card-premium p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(ticket.priority)}`}>
                    {ticket.priority}
                </span>

                {ticket.ai_generated && (
                    <span
                        className="flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800"
                        title="Created by AI Copilot"
                    >
                        <span>✨</span> AI
                    </span>
                )}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {ticket.title}
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {ticket.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700/50">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {ticket.tags && ticket.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {tag}
                        </span>
                    ))}
                    {!ticket.tags?.length && (
                        <span className="text-[10px] text-gray-400">#{ticket.id.slice(0, 6)}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {formatRelativeTime(ticket.created_at)}
                    </span>
                    {ticket.assigned_to && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]" title={`Assigned to ${ticket.assigned_to}`}>
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-200">
                                {getInitials(ticket.assigned_to)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
