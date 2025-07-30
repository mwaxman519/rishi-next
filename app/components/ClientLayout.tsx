&quot;use client&quot;;

import { Providers } from &quot;../providers&quot;;
import { EnvironmentIndicator } from &quot;./ui/environment-indicator&quot;;
import { Toaster } from &quot;@/components/ui/toaster&quot;;
import ResponsiveLayout from &quot;./layout/ResponsiveLayout&quot;;
import IframeCompatibility from &quot;./IframeCompatibility&quot;;
import OfflineStatus from &quot;./OfflineStatus&quot;;
import OfflineDataManager from &quot;./OfflineDataManager&quot;;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <IframeCompatibility>
      <Providers>
        {/* Main content with responsive layout (handles desktop/mobile) */}
        <ResponsiveLayout>{children}</ResponsiveLayout>

        {/* Environment indicator overlay */}
        <EnvironmentIndicator />

        {/* Offline status for field workers */}
        <OfflineStatus />

        {/* Offline data management for entire app */}
        <OfflineDataManager />

        {/* Toast notifications */}
        <Toaster />
      </Providers>
    </IframeCompatibility>
  );
}
