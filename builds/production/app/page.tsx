'use client';

import { useEffect } from 'react';

export default function MobileApp() {
  useEffect(() => {
    // For mobile app, redirect to live Vercel backend
    if (typeof window !== 'undefined') {
      window.location.href = 'https://rishi-platform.vercel.app';
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-teal-50">
      <div className="text-center p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            Rishi Platform
          </h1>
          <p className="text-gray-600">
            Connecting to secure backend...
          </p>
        </div>
        
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-800 mx-auto mb-4"></div>
        
        <p className="text-sm text-gray-500">
          Mobile app loading
        </p>
      </div>
    </div>
  );
}
