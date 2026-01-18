import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Methodology = 'kanban' | 'scrum' | 'custom';

export interface MethodologyConfig {
    kanban: {
        wipLimit: number;
        cycleTimeTracking: boolean;
    };
    scrum: {
        sprintDuration: string;
        backlogGrooming: boolean;
    };
    custom: {
        customStatuses: boolean;
        rolePermissions: boolean;
        automationRules: boolean;
    };
}

interface SettingsContextType {
    selectedMethodology: Methodology;
    config: MethodologyConfig;
    setMethodology: (methodology: Methodology) => void;
    updateConfig: (newConfig: MethodologyConfig) => void;
}

const defaultSettings: MethodologyConfig = {
    kanban: {
        wipLimit: 5,
        cycleTimeTracking: true,
    },
    scrum: {
        sprintDuration: '2_weeks',
        backlogGrooming: true,
    },
    custom: {
        customStatuses: false,
        rolePermissions: false,
        automationRules: false,
    },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedMethodology, setSelectedMethodology] = useState<Methodology>('kanban');
    const [config, setConfig] = useState<MethodologyConfig>(defaultSettings);

    // Initialize from localStorage
    useEffect(() => {
        const savedMethodology = localStorage.getItem('methodology_type') as Methodology;
        const savedConfig = localStorage.getItem('methodology_config');

        if (savedMethodology) {
            setSelectedMethodology(savedMethodology);
        }
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Failed to parse saved config', e);
            }
        }
    }, []);

    // Save changes to localStorage
    const setMethodology = (methodology: Methodology) => {
        setSelectedMethodology(methodology);
        localStorage.setItem('methodology_type', methodology);
    };

    const updateConfig = (newConfig: MethodologyConfig) => {
        setConfig(newConfig);
        localStorage.setItem('methodology_config', JSON.stringify(newConfig));
    };

    return (
        <SettingsContext.Provider value={{ selectedMethodology, config, setMethodology, updateConfig }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
