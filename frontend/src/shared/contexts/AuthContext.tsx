import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@services/api';
import type { UserResponse, LoginRequest, RegisterRequest, AuthResponse } from '@shared/types';

interface AuthContextType {
    user: UserResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = () => {
            try {
                const storedUser = authService.getUser();
                const token = authService.getToken();

                if (storedUser && token) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Failed to restore session:', error);
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await authService.login(email, password);
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await authService.register(data);
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
