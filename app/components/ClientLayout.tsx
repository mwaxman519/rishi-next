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
        
        {/* Temporary: Ensure no OfflineStatus renders */}
        <style jsx global>{`
          .fixed.top-16.left-4.z-50.bg-green-500 {
            display: none !important;
          }
        `}</style>

        {/* Toast notifications */}
        <Toaster />
      </Providers>
    </IframeCompatibility>
  );
}
