"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Import auth service types
import {
  useAuthService,
  UserSession,
  LoginCredentials,
  RegisterData,
} from "./useAuthService";
import { useReplitAuth } from "./useReplitAuth";

// Define registration result interface
interface RegisterResult {
  success: boolean;
  error?: string;
}

// Define the Auth context shape
interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  isRishiManagement: boolean;
  isFieldManager: boolean;
  isBrandAgent: boolean;
  isClientUser: boolean;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    confirmPassword: string,
    role: string,
    registrationPasscode?: string,
  ) => Promise<RegisterResult>;
}

// Create the Auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  hasPermission: () => false,
  isRishiManagement: false,
  isFieldManager: false,
  isBrandAgent: false,
  isClientUser: false,
  isSuperAdmin: false,
  logout: async () => {
    /* Default implementation */
  },
  login: async () => {
    console.error("Login not implemented in default context");
    return false;
  },
  register: async () => {
    console.error("Register not implemented in default context");
    return { success: false, error: "Registration not implemented" };
  },
});

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use our auth service client
  const authService = useAuthService();
  
  // Use Replit-specific auth for development
  const replitAuth = useReplitAuth();

  // Load the user on initial mount
  useEffect(() => {
    // Skip during static generation
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    async function loadUser() {
      try {
        setIsLoading(true);
        setError(null);

        // In development with Replit, use localStorage-based auth to avoid fetch issues
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname.includes('replit.dev')) {
          console.log('Using Replit-specific authentication');
          
          // Wait for Replit auth to complete loading
          if (replitAuth.isLoading) {
            setIsLoading(true);
            return;
          }
          
          setUser(replitAuth.user);
          setIsLoading(false);
          console.log('Authentication state set:', { 
            user: replitAuth.user?.username, 
            role: replitAuth.user?.role, 
            isSuperAdmin: replitAuth.user?.role === 'super_admin',
            authIsLoading: false 
          });
          return;
        }

        console.log('Checking authentication via session endpoint...');
        
        // Try session endpoint to check authentication for production
        const { user: sessionUser } = await authService.getSession();
        console.log('Session user received:', sessionUser);
        
        if (sessionUser && sessionUser.id) {
          console.log('User authenticated via session:', sessionUser.username);
          setUser(sessionUser);
        } else {
          console.log('No valid session found - user not authenticated');
          setUser(null);
        }
        
      } catch (sessionError) {
        console.log('Session endpoint failed:', sessionError);
        
        // Fallback to Replit auth in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Falling back to Replit authentication');
          
          // Wait for Replit auth to complete loading
          if (replitAuth.isLoading) {
            setIsLoading(true);
            return;
          }
          
          setUser(replitAuth.user);
          setIsLoading(false);
          console.log('Fallback authentication state set:', { 
            user: replitAuth.user?.username, 
            role: replitAuth.user?.role, 
            isSuperAdmin: replitAuth.user?.role === 'super_admin',
            authIsLoading: false 
          });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
    
    // Listen for login success events to refresh auth state
    const handleLoginSuccess = () => {
      console.log('Login success event received, reloading user...');
      loadUser();
    };

    window.addEventListener('auth-login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('auth-login-success', handleLoginSuccess);
    };
  }, [authService]); // Remove replitAuth dependencies to prevent loops

  // Permission checking function
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Basic permission checks based on role
    const rolePermissions: Record<string, string[]> = {
      'internal_admin': ['read:*', 'create:*', 'update:*'],
      'internal_field_manager': ['read:staff', 'update:staff', 'read:locations'],
      'brand_agent': ['read:own', 'update:own'],
      'client_manager': ['read:organization', 'update:organization'],
      'client_user': ['read:organization']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.some(p => p === permission || p.endsWith(':*'));
  };

  // Role checking helper functions
  const isRishiManagement = user?.role === 'super_admin' || user?.role === 'internal_admin';
  const isFieldManager = user?.role === 'internal_field_manager';
  const isBrandAgent = user?.role === 'brand_agent';
  const isClientUser = user?.role === 'client_user' || user?.role === 'client_manager';
  const isSuperAdmin = user?.role === 'super_admin';

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login({ username, password });
      if (result.success && result.user) {
        setUser(result.user);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
      return false;
    }
  };

  // Register function
  const register = async (
    username: string,
    password: string,
    confirmPassword: string,
    role: string,
    registrationPasscode?: string,
  ): Promise<RegisterResult> => {
    try {
      const result = await authService.register({
        username,
        password,
        confirmPassword,
        role,
        registrationPasscode,
      });
      
      if (result.success && result.user) {
        setUser(result.user);
        setError(null);
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(new Error(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if logout request fails
      setUser(null);
      setError(null);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    hasPermission,
    isRishiManagement,
    isFieldManager,
    isBrandAgent,
    isClientUser,
    isSuperAdmin,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use the Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}