import { io, Socket } from 'socket.io-client';
import type { NotificationData } from '../types';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    /**
     * Connect to Socket.IO server
     */
    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        const url = import.meta.env.VITE_API_URL || 'http://localhost:5001';

        this.socket = io(url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket.IO connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket.IO disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        return this.socket;
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    /**
     * Subscribe to a project's updates
     */
    subscribeToProject(projectId: string): void {
        if (this.socket) {
            this.socket.emit('subscribe_project', { project_id: projectId });
        }
    }

    /**
     * Listen to notifications
     */
    onNotification(callback: (data: NotificationData) => void): () => void {
        if (!this.socket) {
            this.connect();
        }

        this.socket!.on('notification', callback);

        // Return cleanup function
        return () => {
            this.socket?.off('notification', callback);
        };
    }

    /**
     * Listen to ticket moved events
     */
    onTicketMoved(callback: (data: any) => void): () => void {
        if (!this.socket) {
            this.connect();
        }

        this.socket!.on('ticket:moved', callback);

        return () => {
            this.socket?.off('ticket:moved', callback);
        };
    }

    /**
     * Listen to ticket created events
     */
    onTicketCreated(callback: (data: any) => void): () => void {
        if (!this.socket) {
            this.connect();
        }

        this.socket!.on('ticket:created', callback);

        return () => {
            this.socket?.off('ticket:created', callback);
        };
    }

    /**
     * Listen to ticket assigned events
     */
    onTicketAssigned(callback: (data: any) => void): () => void {
        if (!this.socket) {
            this.connect();
        }

        this.socket!.on('ticket:assigned', callback);

        return () => {
            this.socket?.off('ticket:assigned', callback);
        };
    }

    /**
     * Get socket instance
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const socketService = new SocketService();
