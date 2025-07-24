"use client";

import { Providers } from "../providers";
import { EnvironmentIndicator } from "./ui/environment-indicator";
import { Toaster } from "@/components/ui/toaster";
import ResponsiveLayout from "./layout/ResponsiveLayout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Providers>
      {/* Main content with responsive layout (handles desktop/mobile) */}
      <ResponsiveLayout>{children}</ResponsiveLayout>

      {/* Environment indicator overlay */}
      <EnvironmentIndicator />

      {/* Toast notifications */}
      <Toaster />
    </Providers>
  );
}
