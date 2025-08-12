import type { Metadata } from "next";
import "./globals.css";
import "./styles/date-picker.css";
import "./styles/custom-datepicker.css";
import "./components/agent-calendar/calendar-fixes.css";
import "./components/agent-calendar/calendar-buttons.css";
import "./components/agent-calendar/calendar-compact.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ClientLayout from "./components/ClientLayout";
import DevToolsScript from "./components/DevToolsScript";
import ThemeScript from "./components/ThemeScript";
import ServiceWorkerRegistration from "./service-worker-registration";
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
        <ServiceWorkerRegistration />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
