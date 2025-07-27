"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      const response = await fetch("/api/auth-service/session");
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
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      
      // Make the logout API call using the auth service
      const response = await fetch("/api/auth-service/logout", {
        method: "POST",
      });
      
      if (response.ok) {
        // Clear user state only after successful logout
        setUser(null);
        
        // Clear any client-side storage that might persist session
        localStorage.removeItem("user");
        localStorage.removeItem("auth-token");
        localStorage.removeItem("session");
        
        // Use replace to prevent user from going back to logged in state
        router.replace("/auth/login");
      } else {
        // If logout fails, still clear user state for security
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("auth-token");
        localStorage.removeItem("session");
        router.replace("/auth/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if the API call fails, we still want to clear the user state
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("auth-token");
      localStorage.removeItem("session");
      router.replace("/auth/login");
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