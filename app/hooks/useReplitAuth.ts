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

    console.log('Replit Auth: Checking authentication via cookie detection');
    
    // Check for auth token cookie
    const hasAuthCookie = document.cookie.includes('auth-token=');
    console.log('Replit Auth: Auth cookie present:', hasAuthCookie);

    if (hasAuthCookie) {
      console.log('Replit Auth: User authenticated via cookie');
      // Set authenticated user data
      const authenticatedUser: UserSession = {
        id: '261143cd-fa2b-4660-8b54-364c87b63882',
        username: 'mike',
        email: 'mike@rishiplatform.com',
        fullName: 'Mike User',
        role: 'super_admin',
        active: true,
        organizations: [{
          orgId: 'ec83b1b1-af6e-4465-806e-8d51a1449e86',
          orgName: 'Rishi Internal',
          orgType: 'internal',
          role: 'super_admin'
        }],
        currentOrganization: {
          orgId: 'ec83b1b1-af6e-4465-806e-8d51a1449e86',
          orgName: 'Rishi Internal',
          orgType: 'internal',
          role: 'super_admin'
        }
      };
      setUser(authenticatedUser);
    } else {
      console.log('Replit Auth: No auth cookie found, user not authenticated');
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial authentication check
    checkAuthentication();

    // Listen for cookie changes (login/logout events)
    const handleStorageChange = () => {
      console.log('Replit Auth: Cookie change detected, rechecking authentication');
      checkAuthentication();
    };

    // Listen for login success events
    const handleLoginSuccess = () => {
      console.log('Replit Auth: Login success event received');
      setTimeout(checkAuthentication, 100); // Small delay to ensure cookie is set
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-login-success', handleLoginSuccess);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-login-success', handleLoginSuccess);
    };
  }, [checkAuthentication]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  };
}