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
        
        {/* Force hide any old connection indicators */}
        <style jsx global>{`
          div[class*="fixed"][class*="top-16"][class*="left-4"],
          div[class*="fixed"][class*="bg-green-500"],
          div[class*="fixed"][class*="text-white"]:has(.lucide-wifi),
          .fixed.top-16.left-4.z-50,
          [class*="bg-green-500"][class*="text-white"][class*="px-3"][class*="py-2"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            left: -9999px !important;
          }
        `}</style>

        {/* Toast notifications */}
        <Toaster />
      </Providers>
    </IframeCompatibility>
  );
}
