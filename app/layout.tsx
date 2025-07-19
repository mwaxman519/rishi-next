import type { Metadata } from "next";
import "./globals.css";
import "./styles/date-picker.css";
import "./styles/custom-datepicker.css";
import ClientLayout from "./components/ClientLayout";
import DevToolsScript from "./components/DevToolsScript";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply theme immediately to prevent flash
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to light theme if localStorage is not available
                  document.documentElement.classList.remove('dark');
                }
              })();
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(registrationError => console.log('SW registration failed'));
                });
              }
              
              // Prevent hydration issues in development
              if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                window.addEventListener('load', () => {
                  // Force re-render after hydration is complete
                  setTimeout(() => {
                    if (document.readyState === 'complete') {
                      // This helps with Replit preview refresh issues
                      const event = new CustomEvent('replit-hydration-complete');
                      window.dispatchEvent(event);
                    }
                  }, 500);
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans bg-gray-50 dark:bg-gray-900 min-h-screen h-full">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
