&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;

interface User {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: string;
  active: boolean;
  organizations: Array<{
    orgId: string;
    orgName: string;
    orgType: string;
    role: string;
    isPrimary: boolean;
  }>;
  currentOrganization: {
    orgId: string;
    orgName: string;
    orgType: string;
    role: string;
    isPrimary: boolean;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only fetch user once to prevent multiple calls
    if (!initialized) {
      fetchUser();
    }
  }, [initialized]);

  const fetchUser = async () => {
    try {
      const response = await fetch(&quot;/api/auth-service/session&quot;);
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.success && sessionData.user) {
          setUser(sessionData.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(&quot;Error fetching user:&quot;, error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(&quot;/api/auth/login&quot;, {
      method: &quot;POST&quot;,
      headers: {
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || &quot;Login failed&quot;);
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      
      // Make the logout API call using the auth service
      const response = await fetch(&quot;/api/auth-service/logout&quot;, {
        method: &quot;POST&quot;,
      });
      
      if (response.ok) {
        // Clear user state only after successful logout
        setUser(null);
        
        // Clear any client-side storage that might persist session
        localStorage.removeItem(&quot;user&quot;);
        localStorage.removeItem(&quot;auth-token&quot;);
        localStorage.removeItem(&quot;session&quot;);
        
        // Use replace to prevent user from going back to logged in state
        router.replace(&quot;/auth/login&quot;);
      } else {
        // If logout fails, still clear user state for security
        setUser(null);
        localStorage.removeItem(&quot;user&quot;);
        localStorage.removeItem(&quot;auth-token&quot;);
        localStorage.removeItem(&quot;session&quot;);
        router.replace(&quot;/auth/login&quot;);
      }
    } catch (error) {
      console.error(&quot;Error logging out:&quot;, error);
      // Even if the API call fails, we still want to clear the user state
      setUser(null);
      localStorage.removeItem(&quot;user&quot;);
      localStorage.removeItem(&quot;auth-token&quot;);
      localStorage.removeItem(&quot;session&quot;);
      router.replace(&quot;/auth/login&quot;);
    } finally {
      setLoggingOut(false);
    }
  };

  return {
    user,
    loading,
    loggingOut,
    isAuthenticated: !!user,
    login,
    logout,
    refetch: fetchUser,
  };
}