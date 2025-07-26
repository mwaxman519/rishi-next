"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface AuthorizationContextType {
  checkPermission: (permission: string, organizationId?: string) => boolean;
  hasRole: (role: string) => boolean;
  isAuthorized: boolean;
  isLoading: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/rbac/user-permissions');
        if (response.ok) {
          const data = await response.json();
          setUserPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, [isAuthenticated, user]);

  const checkPermission = (permission: string, organizationId?: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Super admins have all permissions
    if (user.role === 'super_admin') return true;
    
    // Check if user has specific permission
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthorizationContextType = {
    checkPermission,
    hasRole,
    isAuthorized: isAuthenticated,
    isLoading,
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization(): AuthorizationContextType {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthorization must be used within an AuthorizationProvider');
  }
  return context;
}