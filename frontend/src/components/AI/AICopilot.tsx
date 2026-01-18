import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AICopilot.module.css';

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
                className={styles.floatingButton}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Copilot"
            >
                <span className={styles.icon}>🤖</span>
            </button>

            {/* Chat Interface */}
            {isOpen && (
                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerContent}>
                            <span className={styles.headerIcon}>🤖</span>
                            <div>
                                <h3 className={styles.headerTitle}>AI Copilot</h3>
                                <p className={styles.headerSubtitle}>Describe your task in natural language</p>
                            </div>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.chatBody}>
                        <div className={styles.exampleMessages}>
                            <p className={styles.exampleTitle}>Try saying:</p>
                            <button
                                className={styles.exampleButton}
                                onClick={() => setMessage('Fix the login button on mobile Safari')}
                            >
                                "Fix the login button on mobile Safari"
                            </button>
                            <button
                                className={styles.exampleButton}
                                onClick={() => setMessage('Add dark mode to the dashboard')}
                            >
                                "Add dark mode to the dashboard"
                            </button>
                            <button
                                className={styles.exampleButton}
                                onClick={() => setMessage('Optimize database queries for user search')}
                            >
                                "Optimize database queries for user search"
                            </button>
                        </div>
                    </div>

                    <form className={styles.chatFooter} onSubmit={handleSubmit}>
                        <textarea
                            className={styles.input}
                            placeholder="Describe what needs to be done..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={!message.trim() || loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Create Ticket
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};
