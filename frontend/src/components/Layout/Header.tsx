import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

export const Header: React.FC = () => {
    const { logout } = useAuth();
    const { isConnected } = useSocket();

    return (
        <header className="h-16 px-6 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border sticky top-0 z-20 flex items-center justify-between transition-colors duration-300">
            {/* Left: Breadcrumbs or Context */}
            <div className="flex items-center gap-4">
                <span className="text-gray-400 dark:text-gray-500">BlackyFetch Development</span>
                <span className="text-gray-300 dark:text-gray-600">/</span>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Sprint 24 Board</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs font-medium">
                        Active
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-64 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                    <span className="text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                </div>

                {/* Connection Status */}
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${isConnected
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {isConnected ? 'Online' : 'Offline'}
                </div>

                {/* Notifications */}
                <button className="p-2 relative rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                    🔔
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-dark-card rounded-full" />
                </button>

                {/* Logout Button (Temporary placement) */}
                <button
                    onClick={logout}
                    className="text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Sign Out"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
};
