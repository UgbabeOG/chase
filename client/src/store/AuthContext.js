import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshUser = useCallback(async () => {
        if (!api.isAuthenticated()) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const userData = await api.getMe();
            setUser(userData);
        }
        catch {
            setUser(null);
            api.clearAuth();
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            }
            catch {
                localStorage.removeItem('user');
            }
        }
        refreshUser();
    }, [refreshUser]);
    const login = async (username, password, otp) => {
        try {
            if (otp) {
                await api.login2FA({ username, password, otp });
            }
            else {
                const result = await api.login({ username, password });
                if (result.requires2FA) {
                    return { requires2FA: true };
                }
            }
            await refreshUser();
            return {};
        }
        catch (error) {
            throw error;
        }
    };
    const logout = async () => {
        try {
            await api.logout();
        }
        finally {
            setUser(null);
        }
    };
    const setup2FA = async () => {
        return api.setup2FA();
    };
    const verify2FA = async (token) => {
        await api.verify2FA(token);
        await refreshUser();
    };
    const disable2FA = async (password) => {
        await api.disable2FA(password);
        await refreshUser();
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshUser,
            setup2FA,
            verify2FA,
            disable2FA,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
