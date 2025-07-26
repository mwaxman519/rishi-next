"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { Button } from "./components/ui/button";
import {
  ArrowRight,
  Calendar,
  Users,
  Shield,
  Clock,
  Building,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Check if running in mobile/Capacitor environment
  const isMobile = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.protocol === 'capacitor:' ||
     window.location.protocol === 'file:' ||
     navigator.userAgent.includes('CapacitorWebView') ||
     navigator.userAgent.includes('Android') ||
     // Check if we're in a webview that doesn't have standard browser features
     !(window as any).chrome || 
     // Check if we're loading from the app assets directory
     window.location.pathname.includes('android_asset'));

  useEffect(() => {
    // For mobile environments, don't auto-redirect - show mobile interface
    if (isMobile) {
      return;
    }
    
    // Simple redirect for authenticated users in web environment
    if (!loading && user && user.role === "super_admin" && !redirecting) {
      console.log("Redirecting super admin to dashboard");
      setRedirecting(true);
      // Use immediate redirect without delay
      router.replace("/dashboard");
    }
  }, [user, loading, router, isMobile, redirecting]);

  // Show loading state while authentication is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Rishi Platform...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-2">
              Development environment - if this takes too long, refresh the page
            </p>
          )}
        </div>
      </div>
    );
  }

  // If running in mobile environment, show mobile-optimized interface
  if (isMobile) {
    // Import and render mobile page component dynamically
    const MobilePage = React.lazy(() => import('./mobile-page'));
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading Mobile App...</p>
          </div>
        </div>
      }>
        <MobilePage />
      </React.Suspense>
    );
  }

  // If user is logged in, handle accordingly
  if (user) {
    // For super admin users, don't render anything - let redirect happen silently
    if (user.role === "super_admin") {
      return null; // Don't render anything, let the redirect effect handle it
    }

    // For other roles, show welcome with dashboard link
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">
            Welcome back, {user.fullName || user.username}!
          </h1>
          <p className="text-xl mb-8">
            You're logged into the Rishi Workforce Management platform.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="mr-4">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="mr-4">
              View Documentation
            </Button>
          </Link>
          <Link href="/dashboard/admin/infrastructure">
            <Button variant="secondary" size="lg">
              System Infrastructure
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // For non-logged in users, show the public landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/logos/rishi-logo-main.png"
              alt="Rishi Platform"
              className="w-64 h-auto shadow-lg"
              onError={(e) => {
                console.log('Main logo failed on homepage, trying icon');
                e.currentTarget.src = '/assets/logos/rishi-logo-icon.png';
                e.currentTarget.className = 'w-20 h-20 shadow-lg';
              }}
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Rishi Workforce Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Comprehensive Rishi Platform for legal states (CO, OR, WA) featuring
            8-stage booking lifecycle and UUID architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto sm:max-w-none">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3">
                Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50 hover:border-purple-700 dark:hover:bg-purple-900 dark:text-purple-400 dark:border-purple-400 px-8 py-3">
                Register
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Calendar className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Booking Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              8-stage booking lifecycle with calendar views, regional filtering,
              and staff assignments.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Users className="w-12 h-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete workforce oversight with performance metrics and
              role-based access control.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Shield className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multi-Organization</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organization isolation with tiered service models and feature
              access control.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Clock className="w-12 h-12 text-teal-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive time tracking with clock-in/out, break management,
              and overtime calculations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <Building className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Multi-State Operations
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Designed for cannabis legal states with region-specific workflows
              and compliance tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
