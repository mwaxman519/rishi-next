&quot;use client&quot;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  requiredRole 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth-service/session/');
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
          setIsAuthenticated(true);
          
          // Check role if required
          if (requiredRole && data.user?.role !== requiredRole) {
            router.push('/unauthorized');
            return;
          }
        } else if (requireAuth) {
          router.push('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          router.push('/auth/login');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, requiredRole, router]);

  if (isLoading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <div className=&quot;animate-spin rounded-full h-32 w-32 border-b-2 border-primary&quot;></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}

// Also export as default for backwards compatibility
export default AuthGuard;