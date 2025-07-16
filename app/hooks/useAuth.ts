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
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refetch: fetchUser,
  };
}