"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RBACContextType {
  hasPermission: (permission: string) => boolean;
  userRole: string | null;
  permissions: string[];
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await fetch('/api/auth/check-permission');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || null);
          setPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const value: RBACContextType = {
    hasPermission,
    userRole,
    permissions,
    isLoading,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC(): RBACContextType {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}