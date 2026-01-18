import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
    LayoutDashboard,
    FolderKanban,
    Columns3,
    Calendar,
    BarChart3,
    Settings,
    MoreVertical,
    GitBranch,
    Users,
    Puzzle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const isSettingsActive = location.pathname.startsWith('/settings');

    // Helper for nav items
    const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />
                    )}
                    <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                        {icon}
                    </span>
                    <span>{label}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col transition-colors duration-300 z-30">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-dark-border/50">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                        B
                    </div>
                    <span className="font-display font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                        BlackyFetch
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Workspace
                </div>
                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} strokeWidth={1.5} />} label="Dashboard" />
                <NavItem to="/projects" icon={<FolderKanban size={20} strokeWidth={1.5} />} label="Projects" />
                <NavItem to="/board" icon={<Columns3 size={20} strokeWidth={1.5} />} label="Kanban Board" />
                <NavItem to="/calendar" icon={<Calendar size={20} strokeWidth={1.5} />} label="Calendar" />
                <NavItem to="/reports" icon={<BarChart3 size={20} strokeWidth={1.5} />} label="Reports" />

                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Configuration
                </div>
                <NavItem to="/settings" icon={<Settings size={20} strokeWidth={1.5} />} label="Settings" />

                {/* Settings sub-navigation */}
                {isSettingsActive && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                        <NavLink
                            to="/settings/methodology"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`
                            }
                        >
                            <GitBranch size={16} strokeWidth={1.5} />
                            Methodology
                        </NavLink>
                        <NavLink
                            to="/settings/team"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`
                            }
                        >
                            <Users size={16} strokeWidth={1.5} />
                            Team Members
                        </NavLink>
                        <NavLink
                            to="/settings/integrations"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`
                            }
                        >
                            <Puzzle size={16} strokeWidth={1.5} />
                            Integrations
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* User Profile */}
            {user && (
                <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-xs font-bold">
                                {getInitials(user.username)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {user.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.role}
                            </p>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            <MoreVertical size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
