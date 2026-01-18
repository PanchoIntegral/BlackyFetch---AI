import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const MOCK_USER: User = {
    id: 'user-123',
    email: 'developer@blackyfetch.com',
    username: 'Developer',
    role: 'builder' as UserRole,
    github_username: 'dev_github',
    created_at: new Date().toISOString(),
    is_active: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Auto-login with mock user for development
            setUser(MOCK_USER);
            localStorage.setItem('user', JSON.stringify(MOCK_USER));
        }
    }, []);

    const login = async (_email: string, _password: string) => {
        // Mock login - in production, this would call the backend API
        // For now, just set the mock user
        setUser(MOCK_USER);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
