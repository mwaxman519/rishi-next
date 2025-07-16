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
    // Log the error to an error reporting service
    console.error('Documentation error:', error);
  }, [error]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
          Documentation Error
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Sorry, there was an error loading the documentation. This might be a temporary issue.
        </p>
        <div className="space-y-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            ↻ Try again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Return to Home
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Documentation Index
          </Link>
        </div>
      </div>
    </div>
  );
}