"use client";

import { Providers } from "../providers";
import { EnvironmentIndicator } from "./ui/environment-indicator";
import { Toaster } from "@/components/ui/toaster";
import ResponsiveLayout from "./layout/ResponsiveLayout";
import IframeCompatibility from "./IframeCompatibility";
import IframeVisibilityFix from "./IframeVisibilityFix";
import OfflineDataManager from "./OfflineDataManager";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <IframeCompatibility>
      <IframeVisibilityFix />
      <Providers>
        {/* Main content with responsive layout (handles desktop/mobile) */}
        <ResponsiveLayout>{children}</ResponsiveLayout>

        {/* Environment indicator overlay */}
        <EnvironmentIndicator />

        {/* Offline data management for entire app */}
        <OfflineDataManager />

        {/* Toast notifications */}
        <Toaster />
      </Providers>
    </IframeCompatibility>
  );
}
