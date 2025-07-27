"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isSuperAdmin: false,
  login: async () => false,
  logout: async () => {},
});

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('[SIMPLE AUTH] Attempting login for:', username);

      const response = await fetch("/api/auth-service/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('[SIMPLE AUTH] Login failed:', response.status);
        return false;
      }

      const data = await response.json();
      if (data.success && data.user) {
        console.log('[SIMPLE AUTH] Login successful:', data.user.username);
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[SIMPLE AUTH] Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth-service/logout", { method: "POST" });
      setUser(null);
      console.log('[SIMPLE AUTH] Logged out successfully');
    } catch (error) {
      console.error('[SIMPLE AUTH] Logout error:', error);
      setUser(null); // Clear user anyway
    }
  };

  const value = {
    user,
    isLoading,
    isSuperAdmin: user?.role === 'super_admin',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}