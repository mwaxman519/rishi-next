&quot;use client&quot;;

import React from &quot;react&quot;;
import { QueryClientProvider } from &quot;@tanstack/react-query&quot;;
import { queryClient } from &quot;./lib/queryClient&quot;;
import { AuthProvider, useAuth } from &quot;./hooks/useAuth&quot;;
import { RBACProvider } from &quot;./contexts/RBACProvider&quot;;
import { OrganizationProvider } from &quot;./contexts/OrganizationProvider&quot;;
import { NavigationProvider } from &quot;./navigation/NavigationProvider&quot;;
import { GoogleMapsProvider } from &quot;./components/maps/GoogleMapsContext&quot;;
import { SidebarProvider } from &quot;./hooks/useSidebarState&quot;;
import { ThemeProvider } from &quot;./hooks/useTheme&quot;;
import { ToastProvider } from &quot;./components/ui/toast-context&quot;;

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
