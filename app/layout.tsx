import type { Metadata } from &quot;next&quot;;
import &quot;./globals.css&quot;;
import &quot;./styles/date-picker.css&quot;;
import &quot;./styles/custom-datepicker.css&quot;;
import &quot;./components/agent-calendar/calendar-fixes.css&quot;;
import &quot;./components/agent-calendar/calendar-buttons.css&quot;;
import &quot;./components/agent-calendar/calendar-compact.css&quot;;
import &quot;react-big-calendar/lib/css/react-big-calendar.css&quot;;
import ClientLayout from &quot;./components/ClientLayout&quot;;
import DevToolsScript from &quot;./components/DevToolsScript&quot;;
import ThemeScript from &quot;./components/ThemeScript&quot;;
import { Providers } from &quot;./providers&quot;;

export const metadata: Metadata = {
  title: &quot;Rishi Platform&quot;,
  description: &quot;Rishi Platform for workforce management and operations&quot;,
  manifest: &quot;/manifest.json&quot;,
  icons: {
    icon: &quot;/favicon.ico&quot;,
    apple: &quot;/icons/icon-192x192.svg&quot;,
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
    <html lang=&quot;en&quot; suppressHydrationWarning>
      <head>
        <meta httpEquiv=&quot;Content-Type&quot; content=&quot;text/html; charset=utf-8&quot; />
        <meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1&quot; />
        {/* Theme script moved to client component to prevent hydration mismatch */}
      </head>
      <body className=&quot;font-sans bg-gray-50 dark:bg-gray-900 min-h-screen h-full&quot;>
        <ThemeScript />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
