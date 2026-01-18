import { useSettings } from '../../contexts/SettingsContext';

import React, { useState, useEffect } from 'react';
import { X, Folder, Github, Hash, Bot, GitBranch, Loader2, LayoutGrid, Repeat } from 'lucide-react';
import type { ProjectMethodology } from '../../types';

export interface ProjectFormData {
    name: string;
    description: string;
    github_repo?: string;
    slack_channel?: string;
    methodology: ProjectMethodology;
    auto_move_enabled: boolean;
    ai_assistant_enabled: boolean;
}

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    initialData?: ProjectFormData;
    isEditing?: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isEditing = false
}) => {
    const { selectedMethodology, config } = useSettings();
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        github_repo: '',
        slack_channel: '',
        methodology: 'kanban', // Will be updated in useEffect
        auto_move_enabled: true,
        ai_assistant_enabled: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    github_repo: initialData.github_repo || '',
                    slack_channel: initialData.slack_channel || '',
                    methodology: initialData.methodology || 'kanban',
                    auto_move_enabled: initialData.auto_move_enabled ?? true,
                    ai_assistant_enabled: initialData.ai_assistant_enabled ?? true
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    github_repo: '',
                    slack_channel: '',
                    methodology: selectedMethodology as ProjectMethodology || 'kanban',
                    auto_move_enabled: true,
                    ai_assistant_enabled: true
                });
            }
        }
    }, [isOpen, initialData, selectedMethodology]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('El nombre del proyecto es requerido');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await onSubmit({
                ...formData,
                github_repo: formData.github_repo?.trim() || undefined,
                slack_channel: formData.slack_channel?.trim() || undefined
            });
            // Reset form
            setFormData({
                name: '',
                description: '',
                github_repo: '',
                slack_channel: '',
                methodology: 'kanban',
                auto_move_enabled: true,
                ai_assistant_enabled: true
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <Folder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Modificar Proyecto' : 'Crear Nuevo Proyecto'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Nombre del Proyecto *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Marketing Website Q3"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe brevemente el objetivo del proyecto..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                        />
                    </div>

                    {/* Methodology Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Metodología
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.methodology === 'kanban'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="methodology"
                                    value="kanban"
                                    checked={formData.methodology === 'kanban'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`p-2 rounded-lg ${formData.methodology === 'kanban'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                    }`}>
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-medium ${formData.methodology === 'kanban'
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-gray-900 dark:text-white'
                                        }`}>Kanban</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Limit: {config.kanban.wipLimit} tasks | {config.kanban.cycleTimeTracking ? 'Cycle Time On' : 'Cycle Time Off'}
                                    </p>
                                </div>
                            </label>

                            <label
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.methodology === 'scrum'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="methodology"
                                    value="scrum"
                                    checked={formData.methodology === 'scrum'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`p-2 rounded-lg ${formData.methodology === 'scrum'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                    }`}>
                                    <Repeat className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-medium ${formData.methodology === 'scrum'
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-gray-900 dark:text-white'
                                        }`}>Scrum</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Sprint: {config.scrum.sprintDuration.replace('_', ' ')} | {config.scrum.backlogGrooming ? 'Grooming On' : 'Grooming Off'}
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Integrations */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <Github className="w-4 h-4 inline mr-1.5" />
                                GitHub Repo
                            </label>
                            <input
                                type="text"
                                name="github_repo"
                                value={formData.github_repo}
                                onChange={handleChange}
                                placeholder="owner/repo"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <Hash className="w-4 h-4 inline mr-1.5" />
                                Slack Channel
                            </label>
                            <input
                                type="text"
                                name="slack_channel"
                                value={formData.slack_channel}
                                onChange={handleChange}
                                placeholder="#project-channel"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Features Toggle */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Funcionalidades
                        </h4>

                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <GitBranch className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Git-Sync</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Auto-mover tickets basado en commits</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="auto_move_enabled"
                                checked={formData.auto_move_enabled}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bot className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">AI Copilot</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Asistente IA para crear tickets</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="ai_assistant_enabled"
                                checked={formData.ai_assistant_enabled}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isEditing ? 'Guardando...' : 'Creando...'}
                                </>
                            ) : (
                                isEditing ? 'Guardar Cambios' : 'Crear Proyecto'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
