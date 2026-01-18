import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, X, MessageSquare, ChevronRight, Send } from 'lucide-react';

interface AICopilotProps {
    projectId: string;
    onTicketCreated?: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ projectId, onTicketCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user) return;

        setLoading(true);
        try {
            // Import ticketApi dynamically to avoid circular dependencies
            const { ticketApi } = await import('../../api/tickets');

            await ticketApi.createTicketWithAI({
                message: message.trim(),
                project_id: projectId,
                created_by: user.id,
                context: {
                    source: 'web_app',
                },
            });

            setMessage('');
            setIsOpen(false);
            onTicketCreated?.();
        } catch (error) {
            console.error('Error creating ticket with AI:', error);
            alert('Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center animate-pulse-slow"
                onClick={() => setIsOpen(!isOpen)}
                title="AI Copilot"
            >
                <Sparkles className="w-8 h-8" />
            </button>

            {/* Chat Interface */}
            {isOpen && (
                <div className="fixed bottom-28 right-8 w-[400px] max-h-[600px] bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 flex flex-col animate-slide-up overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <BotIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">AI Copilot</h3>
                                <p className="text-xs text-white/80">Describe your task in natural language</p>
                            </div>
                        </div>
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-dark-bg/50">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                    <BotIcon size={18} />
                                </div>
                                <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 dark:text-gray-300 shadow-sm max-w-[85%]">
                                    Hi! I can help you create tickets automatically. Try saying:
                                </div>
                            </div>

                            <div className="space-y-2 pl-11">
                                {[
                                    'Fix the login button on mobile Safari',
                                    'Add dark mode to the dashboard',
                                    'Optimize database queries for user search'
                                ].map((text, i) => (
                                    <button
                                        key={i}
                                        className="w-full text-left p-3 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 group"
                                        onClick={() => setMessage(text)}
                                    >
                                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                                        <span>"{text}"</span>
                                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <form className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-card" onSubmit={handleSubmit}>
                        <div className="relative">
                            <textarea
                                className="w-full min-h-[80px] p-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-sm transition-all"
                                placeholder="Describe what needs to be done..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className={`absolute right-3 bottom-3 p-2 rounded-lg ${message.trim() && !loading
                                        ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                    } transition-all duration-200`}
                                disabled={!message.trim() || loading}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

const BotIcon = ({ size = 24 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
    </svg>
);
