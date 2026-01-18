import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../api/socket';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    subscribeToProject: (projectId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to socket on mount
        const socketInstance = socketService.connect();
        setSocket(socketInstance);

        // Listen to connection status
        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            socketService.disconnect();
        };
    }, []);

    const subscribeToProject = (projectId: string) => {
        socketService.subscribeToProject(projectId);
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, subscribeToProject }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
