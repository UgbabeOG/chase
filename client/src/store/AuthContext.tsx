import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, camelCaseKeys } from '../services/api';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: (username: string, password: string, otp?: string) => Promise<{ requires2FA?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setup2FA: () => Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      setUser(null);
      api.clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Transform snake_case to camelCase for any existing stored users
        setUser(camelCaseKeys(parsedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string, otp?: string) => {
    try {
      if (otp) {
        await api.login2FA({ username, password, otp });
      } else {
        const result = await api.login({ username, password });
        if (result.requires2FA) {
          return { requires2FA: true };
        }
      }
      await refreshUser();
      return {};
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.logout();
      // Simulate backend processing for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  const setup2FA = async () => {
    return api.setup2FA();
  };

  const verify2FA = async (token: string) => {
    await api.verify2FA(token);
    await refreshUser();
  };

  const disable2FA = async (password: string) => {
    await api.disable2FA(password);
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isLoggingOut,
        login,
        logout,
        refreshUser,
        setup2FA,
        verify2FA,
        disable2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}