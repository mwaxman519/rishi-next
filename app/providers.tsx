"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { RBACProvider } from "./contexts/RBACProvider";
import { OrganizationProvider } from "./contexts/OrganizationProvider";
import { NavigationProvider } from "./navigation/NavigationProvider";
import { GoogleMapsProvider } from "./components/maps/GoogleMapsContext";
import { SidebarProvider } from "./hooks/useSidebarState";
import { ThemeProvider } from "./hooks/useTheme";
import { ToastProvider } from "./components/ui/toast-context";

// STATIC AUTH PROVIDER - No API calls, no useEffect, no re-renders
const STATIC_USER = {
  id: "mike-id",
  username: "mike", 
  email: "mike@example.com",
  role: "super_admin",
  organizationId: "1",
  organizationName: "Default Organization"
};

const STATIC_AUTH = {
  user: STATIC_USER,
  isLoading: false,
  error: null,
  hasPermission: () => true,
  isRishiManagement: true,
  isFieldManager: true,
  isBrandAgent: true,
  isClientUser: false,
  isSuperAdmin: true,
  logout: async () => { console.log('Static logout called'); },
  login: async () => { console.log('Static login called'); return true; },
  register: async () => { console.log('Static register called'); return { success: true }; }
};

const StaticAuthContext = React.createContext(STATIC_AUTH);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider: Rendering with static user');
  return <StaticAuthContext.Provider value={STATIC_AUTH}>{children}</StaticAuthContext.Provider>;
}

export function useAuth() {
  return STATIC_AUTH;
}

// RBACProviderWithAuth component to access auth context
function RBACProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Get user roles from the user object - fix TypeScript error
  const userRoles = user?.role ? [user.role.toUpperCase()] : ["SUPER_ADMIN"];

  return <RBACProvider initialRoles={userRoles}>{children}</RBACProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OrganizationProvider>
            <RBACProviderWithAuth>
              <SidebarProvider>
                <NavigationProvider>
                  <GoogleMapsProvider>
                    <ToastProvider>{children}</ToastProvider>
                  </GoogleMapsProvider>
                </NavigationProvider>
              </SidebarProvider>
            </RBACProviderWithAuth>
          </OrganizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
