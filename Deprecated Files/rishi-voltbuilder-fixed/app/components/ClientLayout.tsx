"use client";

import { Providers } from "../providers";
import { EnvironmentIndicator } from "./ui/environment-indicator";
import { Toaster } from "@/components/ui/toaster";
import ResponsiveLayout from "./layout/ResponsiveLayout";
import IframeCompatibility from "./IframeCompatibility";
import OfflineStatus from "./OfflineStatus";
import OfflineDataManager from "./OfflineDataManager";

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
