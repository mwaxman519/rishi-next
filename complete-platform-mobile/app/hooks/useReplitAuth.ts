"use client";

import { useState, useEffect, useCallback } from 'react';

// User session interface
interface UserSession {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  organizations: Array<{
    orgId: string;
    orgName: string;
    orgType: string;
    role: string;
  }>;
  currentOrganization: {
    orgId: string;
    orgName: string;
    orgType: string;
    role: string;
  };
}

interface ReplitAuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Replit-specific authentication hook that bypasses fetch issues
 * Uses cookie detection for development environment
 */
export function useReplitAuth(): ReplitAuthState {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthentication = useCallback(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    console.log('Replit Auth: Checking authentication via localStorage (Replit compatibility)');
    
    // Check localStorage for authentication data (works better in Replit)
    const storedUser = localStorage.getItem('rishi-auth-user');
    const storedTimestamp = localStorage.getItem('rishi-auth-timestamp');
    
    console.log('Replit Auth: Stored data check:', {
      hasStoredUser: !!storedUser,
      hasTimestamp: !!storedTimestamp,
      cookieString: document.cookie
    });

    if (storedUser && storedTimestamp) {
      try {
        const userData = JSON.parse(storedUser);
        const timestamp = parseInt(storedTimestamp);
        const now = Date.now();
        const sessionAge = now - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxAge) {
          console.log('Replit Auth: User authenticated via localStorage');
          
          // Convert stored user data to full UserSession format
          const authenticatedUser: UserSession = {
            id: userData.id || '261143cd-fa2b-4660-8b54-364c87b63882',
            username: userData.username || 'mike',
            email: userData.email || 'mike@rishiplatform.com',
            fullName: userData.fullName || 'Mike User',
            role: userData.role || 'super_admin',
            active: true,
            organizations: [{
              orgId: 'ec83b1b1-af6e-4465-806e-8d51a1449e86',
              orgName: 'Rishi Internal',
              orgType: 'internal',
              role: userData.role || 'super_admin'
            }],
            currentOrganization: {
              orgId: 'ec83b1b1-af6e-4465-806e-8d51a1449e86',
              orgName: 'Rishi Internal',
              orgType: 'internal',
              role: userData.role || 'super_admin'
            }
          };
          setUser(authenticatedUser);
        } else {
          console.log('Replit Auth: Stored session expired, clearing');
          localStorage.removeItem('rishi-auth-user');
          localStorage.removeItem('rishi-auth-timestamp');
          setUser(null);
        }
      } catch (error) {
        console.error('Replit Auth: Error parsing stored user data:', error);
        localStorage.removeItem('rishi-auth-user');
        localStorage.removeItem('rishi-auth-timestamp');
        setUser(null);
      }
    } else {
      console.log('Replit Auth: No valid authentication data found');
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Only check authentication once on mount
    checkAuthentication();

    // Handle logout only
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-logout') {
        console.log('Replit Auth: Logout detected, clearing user');
        setUser(null);
        return;
      }
    };

    // Listen for login success events
    const handleLoginSuccess = () => {
      console.log('Replit Auth: Login success event received');
      setTimeout(checkAuthentication, 200); // Small delay to ensure storage is set
    };

    // Only listen for specific events - no continuous checking
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-login-success', handleLoginSuccess);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-login-success', handleLoginSuccess);
    };
  }, []); // Empty dependency array to run only once

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  };
}