"use client";

import { Providers } from "../providers";
import { EnvironmentIndicator } from "./ui/environment-indicator";
import { Toaster } from "@/components/ui/toaster";
import ResponsiveLayout from "./layout/ResponsiveLayout";
import IframeCompatibility from "./IframeCompatibility";
import OfflineStatus from "./OfflineStatus";
import OfflineDataManager from "./OfflineDataManager";
import AuthErrorBanner from "./AuthErrorBanner";
import DevEnvironmentBanner from "./DevEnvironmentBanner";
import UniversalDebugger from "./UniversalDebugger";
import { useAuth } from "../hooks/useAuth";

interface ClientLayoutProps {
  children: React.ReactNode;
}

function AuthErrorDisplay() {
  const { error } = useAuth();
  
  if (!error) return null;
  
  return (
    <AuthErrorBanner 
      error={error} 
      onRetry={() => window.location.reload()} 
    />
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <IframeCompatibility>
      <Providers>
        {/* Main content with responsive layout (handles desktop/mobile) */}
        <ResponsiveLayout>{children}</ResponsiveLayout>

        {/* Environment indicator overlay */}
        <EnvironmentIndicator />

        {/* Authentication error banner (inside providers to access auth context) */}
        <AuthErrorDisplay />

        {/* Development environment information banner */}
        <DevEnvironmentBanner />
        
        {/* Universal debugger for mobile and development */}
        <UniversalDebugger />

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
