'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Documentation error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Documentation Error
        </h2>
        <p className="text-gray-600 mb-6">
          Something went wrong while loading this documentation page.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/docs"
            className="block w-full text-blue-600 hover:text-blue-700 transition-colors"
          >
            Back to Documentation
          </Link>
          <Link
            href="/"
            className="block w-full text-gray-600 hover:text-gray-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}