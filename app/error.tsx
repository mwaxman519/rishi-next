'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Handle chunk loading errors
    if (error.message?.includes('ChunkLoadError') || error.message?.includes('Loading chunk')) {
      console.log('Chunk loading error detected, attempting page reload...');
      window.location.reload();
      return;
    }
    
    // Log other errors for debugging
    console.error('Application error:', error);
  }, [error]);

  // For chunk loading errors, show minimal UI while reloading
  if (error.message?.includes('ChunkLoadError') || error.message?.includes('Loading chunk')) {
    return (
      <div className=&quot;min-h-screen flex items-center justify-center bg-gray-50&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4&quot;></div>
          <p className=&quot;text-gray-600&quot;>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;min-h-screen flex items-center justify-center bg-gray-50&quot;>
      <div className=&quot;max-w-md w-full text-center&quot;>
        <div className=&quot;bg-white rounded-lg shadow-lg p-6&quot;>
          <h2 className=&quot;text-2xl font-bold text-gray-900 mb-4&quot;>
            Something went wrong!
          </h2>
          <p className=&quot;text-gray-600 mb-6&quot;>
            An error occurred while loading the page.
          </p>
          <button
            onClick={reset}
            className=&quot;w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors&quot;
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}