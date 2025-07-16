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
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth-service/session");
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.success && sessionData.user) {
          setUser(sessionData.user);
        } else {
          setUser(null);
          // If user is not authenticated and trying to access protected content,
          // redirect immediately to login
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
            window.location.replace("/auth/login");
            return;
          }
        }
      } else {
        setUser(null);
        // If user is not authenticated and trying to access protected content,
        // redirect immediately to login
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
          window.location.replace("/auth/login");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      // If user is not authenticated and trying to access protected content,
      // redirect immediately to login
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
        window.location.replace("/auth/login");
        return;
      }
    } finally {
      setLoading(false);
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
    setLoggingOut(true);
    
    try {
      // Make the logout API call
      await fetch("/api/auth-service/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
    
    // Clear user state and redirect immediately
    setUser(null);
    
    // Use window.location.replace for logout to prevent back navigation
    window.location.replace("/auth/login");
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