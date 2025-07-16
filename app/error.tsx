"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // Handle chunk loading errors
  if (error.message?.includes('ChunkLoadError') || error.message?.includes('Loading chunk')) {
    console.log('Chunk loading error detected, attempting page reload...');
    window.location.reload();
    return null;
  }
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] p-8 shadow-md max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-[rgb(var(--foreground))]">
          Something went wrong
        </h1>

        <div className="text-[rgb(var(--muted-foreground))] mb-6">
          {error.message && <p className="mb-2">{error.message}</p>}
          {error.digest && (
            <p className="text-xs opacity-50">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-md hover:bg-[rgb(var(--primary-dark))] transition-colors"
          >
            Try again
          </button>

          <Link
            href="/"
            className="px-4 py-2 border border-[rgb(var(--border))] rounded-md hover:bg-[rgba(var(--primary),0.1)] transition-colors"
          >
            Return home
          </Link>
        </div>

        {/* Only show the error details in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 text-left border-t border-[rgb(var(--border))] pt-4">
            <details className="text-xs text-[rgb(var(--muted-foreground))]">
              <summary className="cursor-pointer mb-2 font-medium">
                Error details (development only)
              </summary>
              <pre className="overflow-auto p-4 bg-[rgb(var(--muted))] rounded-md">
                {error.stack || JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
