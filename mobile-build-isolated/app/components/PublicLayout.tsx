"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { Terminal } from "lucide-react";
import { useClientOnly } from "../hooks/useClientOnly";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const mounted = useClientOnly();
  
  // Client-side environment detection for dev tools button
  let isDevelopment = false;
  if (mounted && typeof window !== 'undefined') {
    // Check if we're in development environment (same logic as development banner)
    const nodeEnv = process.env.NODE_ENV;
    const nextPublicAppEnv = process.env.NEXT_PUBLIC_APP_ENV;
    
    isDevelopment = nodeEnv === 'development' || nextPublicAppEnv === 'development';
    
    // Debug logging for environment detection
    console.log('PublicLayout Environment Debug:', {
      mounted,
      isDevelopment,
      nodeEnv,
      nextPublicAppEnv,
      hostname: window.location.hostname
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(var(--background))]">
      {/* Public Header - Simplified for unauthenticated users */}
      <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 relative flex-shrink-0 mr-2">
              <Image
                src="/assets/logos/rishi-logo-actual.png"
                alt="Rishi Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold hidden sm:inline-block">
              Rishi Platform
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Dev Tools button - development only, visible without authentication */}
            {isDevelopment && (
              <Link href="/dev-tools">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  <Terminal size={16} className="mr-2" />
                  <span className="hidden md:inline">Dev Tools</span>
                  <span className="md:hidden">Dev</span>
                </Button>
              </Link>
            )}
            <a href="/docs" className="mr-2">
              <Button variant="outline" size="sm">
                Documentation
              </Button>
            </a>
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="default" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card))] py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Rishi Platform. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="/docs" className="hover:text-primary">
              Documentation
            </a>
            <a href="/privacy" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
