import type { Metadata } from "next";
import "./globals.css";
import "./globals-iframe.css";
import "./styles/date-picker.css";
import "./styles/custom-datepicker.css";
import "./components/agent-calendar/calendar-fixes.css";
import "./components/agent-calendar/calendar-buttons.css";
import "./components/agent-calendar/calendar-compact.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ClientLayout from "./components/ClientLayout";
import DevToolsScript from "./components/DevToolsScript";
import ThemeScript from "./components/ThemeScript";
// ServiceWorkerRegistration temporarily removed to fix network issues
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Rishi Platform",
  description: "Rishi Platform for workforce management and operations",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.svg",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Theme script moved to client component to prevent hydration mismatch */}
      </head>
      <body className="font-sans bg-gray-50 dark:bg-gray-900 min-h-screen h-full">
        <ThemeScript />
        {/* ServiceWorkerRegistration temporarily removed */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* CRITICAL: Hide all old connection indicators */
            div[class*="fixed"][class*="top-16"][class*="left-4"],
            div[class*="fixed"][class*="bg-green-500"],
            .fixed.top-16.left-4.z-50.bg-green-500,
            [class*="bg-green-500"][class*="text-white"][class*="px-3"][class*="py-2"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              position: absolute !important;
              left: -9999px !important;
              pointer-events: none !important;
              z-index: -1 !important;
            }
          `
        }} />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
