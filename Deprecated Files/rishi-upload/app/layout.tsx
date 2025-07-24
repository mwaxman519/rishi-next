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
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className="font-sans bg-gray-50 dark:bg-gray-900 min-h-screen h-full">
        <ClientLayout>
          <Providers>{children}</Providers>
        </ClientLayout>
      </body>
    </html>
  );
}
