"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { RBACProvider } from "./contexts/RBACProvider";
import { OrganizationProvider } from "./contexts/OrganizationProvider";
import { NavigationProvider } from "./navigation/NavigationProvider";
import { GoogleMapsProvider } from "./components/maps/GoogleMapsContext";
import { SidebarProvider } from "./hooks/useSidebarState";
import { ThemeProvider } from "./hooks/useTheme";
import { ToastProvider } from "./components/ui/toast-context";

// NotificationProvider removed to fix webpack issues

// RBACProviderWithAuth component to access auth context
function RBACProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Get user roles from the user object
  const userRoles =
    user?.roles || (user?.role ? [user.role.toUpperCase()] : []);

  return <RBACProvider initialRoles={userRoles}>{children}</RBACProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

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
