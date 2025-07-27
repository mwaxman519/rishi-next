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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRishiManagement: boolean;
  isFieldManager: boolean;
  isBrandAgent: boolean;
  isClientUser: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => false,
  logout: () => {},
  hasPermission: () => false,
  isRishiManagement: false,
  isFieldManager: false,
  isBrandAgent: false,
  isClientUser: false,
  isSuperAdmin: false,
});

export function FixedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('[FIXED AUTH] Attempting login for:', username);

      const response = await fetch("/api/auth-service/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('[FIXED AUTH] Login failed:', response.status);
        return false;
      }

      const data = await response.json();
      if (data.success && data.user) {
        console.log('[FIXED AUTH] Login successful:', data.user.username);
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[FIXED AUTH] Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    console.log('[FIXED AUTH] Logged out');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    
    const rolePermissions: Record<string, string[]> = {
      'internal_admin': ['read:*', 'create:*', 'update:*'],
      'internal_field_manager': ['read:staff', 'update:staff'],
      'brand_agent': ['read:own', 'update:own'],
      'client_manager': ['read:organization', 'update:organization'],
      'client_user': ['read:organization']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.some(p => p === permission || p.endsWith(':*'));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    isRishiManagement: user?.role === 'super_admin' || user?.role === 'internal_admin',
    isFieldManager: user?.role === 'internal_field_manager',
    isBrandAgent: user?.role === 'brand_agent',
    isClientUser: user?.role === 'client_user' || user?.role === 'client_manager',
    isSuperAdmin: user?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFixedAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFixedAuth must be used within a FixedAuthProvider');
  }
  return context;
}