"use client";

import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add iframe-specific debugging and handling
    const isIframe = window !== window.parent || window.location.hostname.includes('replit');
    console.log('Dashboard layout effect:', { user: !!user, loading, isIframe, pathname: window.location.pathname });
    
    if (!loading && !user) {
      const timer = setTimeout(() => {
        // Check if we're currently on a login attempt redirect
        if (window.location.pathname === '/dashboard' && !user) {
          console.log('Dashboard: No user found after delay, redirecting to login');
          if (isIframe) {
            // For iframe context, use window.location
            console.log('Iframe context detected, using window.location redirect');
            window.location.href = "/auth/login";
          } else {
            router.push("/auth/login");
          }
        }
      }, 5000); // Increased to 5 seconds for iframe context
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Loading Dashboard...</h2>
          <div className="w-16 h-16 border-t-4 border-purple-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="iframe-compatible">
          {children}
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the dashboard.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  const isIframe = window !== window.parent || window.location.hostname.includes('replit');
                  if (isIframe) {
                    window.location.href = "/auth/login";
                  } else {
                    router.push("/auth/login");
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Login
              </button>
              <p className="text-sm text-gray-500">
                Debug: User={user ? 'Yes' : 'No'}, Loading={loading ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
