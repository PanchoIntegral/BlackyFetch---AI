import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import {
    GitBranch,
    Users,
    Puzzle,
    LayoutGrid,
    RefreshCw,
    Sliders,
    CheckCircle2,
    Sparkles,
    ChevronDown,
    Columns3,
    Settings as SettingsIcon,
    Shield
} from 'lucide-react';

import { useSettings, type Methodology } from '../contexts/SettingsContext';

const MethodologySettings: React.FC = () => {
    const { selectedMethodology, config, setMethodology, updateConfig } = useSettings();
    const [showExperimental, setShowExperimental] = useState(false);

    const handleSelectMethodology = (methodology: any) => {
        setMethodology(methodology);
    };

    const MethodologyCard = ({
        type,
        title,
        description,
        icon: Icon,
        badge,
        isSelected,
        children,
    }: {
        type: Methodology;
        title: string;
        description: string;
        icon: React.ElementType;
        badge: string;
        isSelected: boolean;
        children?: React.ReactNode;
    }) => (
        <div
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${isSelected
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-lg shadow-primary-500/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            onClick={() => handleSelectMethodology(type)}
        >
            {/* Active indicator */}
            {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
            )}

            {/* Badge */}
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isSelected
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                    <Icon
                        className={`w-6 h-6 ${isSelected
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        strokeWidth={1.5}
                    />
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isSelected
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {badge}
                </span>
            </div>

            {/* Title and description */}
            <h3 className={`text-lg font-bold mb-2 ${isSelected
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
                }`}>
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {description}
            </p>

            {/* Configuration options */}
            {children}

            {/* Selection button */}
            <button
                className={`w-full mt-4 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isSelected
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
            >
                {isSelected ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                        Current Methodology
                    </>
                ) : (
                    `Select ${title}`
                )}
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Methodology</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Select and customize how your team tracks progress. Changes will apply to all active projects in the workspace immediately.
                </p>
            </div>

            {/* Methodology Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kanban */}
                <MethodologyCard
                    type="kanban"
                    title="Kanban"
                    description="Continuous flow for agile teams. Ideal for operational work and support tickets with variable priorities."
                    icon={Columns3}
                    badge="FLOW"
                    isSelected={selectedMethodology === 'kanban'}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                WIP Limits (Max Tasks)
                            </label>
                            <input
                                type="number"
                                value={config.kanban.wipLimit}
                                onChange={(e) =>
                                    updateConfig({
                                        ...config,
                                        kanban: { ...config.kanban, wipLimit: parseInt(e.target.value) || 0 },
                                    })
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="input-field w-full"
                                min={1}
                                max={20}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Cycle Time Tracking</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateConfig({
                                        ...config,
                                        kanban: { ...config.kanban, cycleTimeTracking: !config.kanban.cycleTimeTracking },
                                    });
                                }}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${config.kanban.cycleTimeTracking
                                    ? 'bg-primary-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${config.kanban.cycleTimeTracking ? 'translate-x-5' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </MethodologyCard>

                {/* Scrum */}
                <MethodologyCard
                    type="scrum"
                    title="Scrum"
                    description="Structured sprints for iterative delivery. Best for product development with clear deliverables."
                    icon={RefreshCw}
                    badge="ACTIVE"
                    isSelected={selectedMethodology === 'scrum'}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Sprint Duration
                            </label>
                            <div className="relative">
                                <select
                                    value={config.scrum.sprintDuration}
                                    onChange={(e) =>
                                        updateConfig({
                                            ...config,
                                            scrum: { ...config.scrum, sprintDuration: e.target.value },
                                        })
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="input-field w-full appearance-none pr-10"
                                >
                                    <option value="1_week">1 Week</option>
                                    <option value="2_weeks">2 Weeks</option>
                                    <option value="3_weeks">3 Weeks</option>
                                    <option value="4_weeks">4 Weeks</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 block">Backlog Grooming</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">Auto-schedule weekly</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateConfig({
                                        ...config,
                                        scrum: { ...config.scrum, backlogGrooming: !config.scrum.backlogGrooming },
                                    });
                                }}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${config.scrum.backlogGrooming
                                    ? 'bg-primary-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${config.scrum.backlogGrooming ? 'translate-x-5' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </MethodologyCard>

                {/* Custom Agile */}
                <MethodologyCard
                    type="custom"
                    title="Custom Agile"
                    description="Tailor your own hybrid workflow. Mix and match components from Scrum, Kanban, and Waterfall."
                    icon={Sliders}
                    badge="HYBRID"
                    isSelected={selectedMethodology === 'custom'}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.custom.customStatuses ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Custom Statuses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.custom.rolePermissions ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Role Permissions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.custom.automationRules ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Automation Rules</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Open custom workflow builder
                            }}
                            className="w-full mt-2 py-2 px-4 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Create Custom Workflow
                        </button>
                    </div>
                </MethodologyCard>
            </div>

            {/* Experimental Features */}
            <div className="card-premium">
                <button
                    onClick={() => setShowExperimental(!showExperimental)}
                    className="w-full p-6 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                            <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 dark:text-white">Experimental Features</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enable AI estimation and predictive velocity.
                            </p>
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showExperimental ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                {showExperimental && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">AI Story Point Estimation</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Automatically estimate story points based on ticket descriptions.
                                </p>
                            </div>
                            <button className="relative w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200">
                                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Predictive Velocity</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Forecast sprint completion based on historical data.
                                </p>
                            </div>
                            <button className="relative w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200">
                                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TeamMembersSettings: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage team members and their roles in the workspace.
            </p>
        </div>
        <div className="card-premium p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Team Management Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">Invite and manage team members, assign roles and permissions.</p>
        </div>
    </div>
);

const IntegrationsSettings: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                Connect your favorite tools and services.
            </p>
        </div>
        <div className="card-premium p-12 text-center">
            <Puzzle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Integrations Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">Connect with GitHub, Slack, Jira, and more.</p>
        </div>
    </div>
);

export const Settings: React.FC = () => {
    const settingsNavItems = [
        { to: '/settings/methodology', label: 'Methodology', icon: GitBranch },
        { to: '/settings/team', label: 'Team Members', icon: Users },
        { to: '/settings/integrations', label: 'Integrations', icon: Puzzle },
    ];

    return (
        <div className="flex gap-8">
            {/* Settings Sidebar */}
            <div className="w-56 flex-shrink-0">
                <div className="sticky top-6">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
                        Settings
                    </h3>
                    <nav className="space-y-1">
                        {settingsNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 min-w-0">
                <Routes>
                    <Route path="/" element={<Navigate to="/settings/methodology" replace />} />
                    <Route path="/methodology" element={<MethodologySettings />} />
                    <Route path="/team" element={<TeamMembersSettings />} />
                    <Route path="/integrations" element={<IntegrationsSettings />} />
                </Routes>
            </div>
        </div>
    );
};
