"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set mock user immediately for development
    setUser({
      id: "mock-user-id",
      username: "admin",
      email: "admin@rishi.com",
      fullName: "Super Admin",
      role: "super_admin",
      organizationId: "00000000-0000-0000-0000-000000000001"
    });
  }, []);

  const login = async (username: string, password: string) => {
    const mockUser = {
      id: "mock-user-id",
      username: "admin",
      email: "admin@rishi.com",
      fullName: "Super Admin",
      role: "super_admin",
      organizationId: "00000000-0000-0000-0000-000000000001"
    };
    setUser(mockUser);
    return mockUser;
  };

  const logout = async () => {
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout,
    refetch: () => {},
  };
}