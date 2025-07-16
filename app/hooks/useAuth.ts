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
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
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
    
    // Use setTimeout to ensure the "Logging out..." state is visible briefly
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 500);
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