import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, CheckSquare, Plus, Pencil, Trash2 } from 'lucide-react';

export interface ProjectCardProps {
    id: string;
    title: string;
    description: string;
    progress: number;
    icon: React.ReactNode;
    colorClass: string;
    teamMembers: { id: string; avatar: string }[];
    taskCount: number;
    ticketCount: number;
    isInvited?: boolean;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    title,
    description,
    progress,
    icon,
    colorClass,
    teamMembers,
    taskCount,
    ticketCount,
    isInvited,
    onClick,
    onEdit,
    onDelete
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        onEdit?.();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        onDelete?.();
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between h-full"
        >
            {/* Top Section */}
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-white`}>
                        <div className={`w-6 h-6 flex items-center justify-center rounded-lg ${colorClass} text-white shadow-sm`}>
                            {icon}
                        </div>
                    </div>

                    {/* Badge or Menu */}
                    {isInvited ? (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 rounded-md border border-purple-100 dark:border-purple-800/50">
                            Invited
                        </span>
                    ) : (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={handleMenuClick}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="sr-only">Menu</span>
                                •••
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden animate-fade-in">
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                                    >
                                        <Pencil className="w-4 h-4 text-gray-400" />
                                        Modify Project
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Project
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Bottom Section */}
            <div>
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-500">Progress</span>
                        <span className={`font-bold ${progress === 100 ? 'text-green-500' : 'text-primary-600'}`}>
                            {progress}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${colorClass.replace('text-', 'bg-')}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700/50">
                    <div className="flex -space-x-2">
                        {teamMembers.slice(0, 3).map((member, i) => (
                            <div
                                key={member.id}
                                className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600"
                                title={`Member ${i + 1}`}
                            >
                                {member.avatar || 'U'}
                            </div>
                        ))}
                        {teamMembers.length > 3 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-500">
                                +{teamMembers.length - 3}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span className="font-medium">{taskCount}</span>
                        </div>

                        <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NewProjectCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group h-full min-h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-all duration-300">
                <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Create New Project</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[200px]">
                Start a new board from scratch
            </p>
        </div>
    );
};
