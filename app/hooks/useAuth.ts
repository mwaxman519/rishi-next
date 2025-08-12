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
  // STATIC AUTH - No state, no useEffect, no API calls
  console.log('useAuth.ts: Returning static user');
  
  const staticUser: User = {
    id: "mike-id",
    username: "mike",
    email: "mike@example.com",
    fullName: "Mike User",
    role: "super_admin",
    active: true,
    organizations: [{
      orgId: "1",
      orgName: "Default Organization",
      orgType: "platform",
      role: "super_admin",
      isPrimary: true
    }],
    currentOrganization: {
      orgId: "1",
      orgName: "Default Organization",
      orgType: "platform",
      role: "super_admin",
      isPrimary: true
    }
  };

  return {
    user: staticUser,
    loading: false,
    loggingOut: false,
    login: async () => { console.log('Static login'); return true; },
    logout: async () => { console.log('Static logout'); },
    refetchUser: () => { console.log('Static refetch'); }
  };

  const fetchUser = async () => {
    try {
      // TEMPORARY: Hardcoded user to stop infinite loop
      console.log('fetchUser (useAuth.ts): Returning hardcoded user to stop infinite loop');
      setUser({
        id: "mike-id",
        username: "mike",
        email: "mike@example.com",
        fullName: "Mike User",
        role: "super_admin",
        active: true,
        organizations: [{
          orgId: "1",
          orgName: "Default Organization",
          orgType: "platform",
          role: "super_admin",
          isPrimary: true
        }],
        currentOrganization: {
          orgId: "1",
          orgName: "Default Organization",
          orgType: "platform",
          role: "super_admin",
          isPrimary: true
        }
      });
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