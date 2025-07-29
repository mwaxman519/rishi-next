'use client';

import { useEffect } from 'react';

export default function MobileLanding() {
  useEffect(() => {
    // Redirect to main app through Vercel serverless
    window.location.href = 'https://rishi-platform.vercel.app';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-purple-800 mb-4">
          Rishi Platform
        </h1>
        <p className="text-gray-600 mb-4">
          Connecting to secure backend...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800 mx-auto"></div>
      </div>
    </div>
  );
}
