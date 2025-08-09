"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, RefreshCw, AlertTriangle } from "lucide-react";
import { TableOfContents } from "./table-of-contents";
import type { DocTree } from "@/components/../lib/docs";

// Using the logo via direct path instead of import
// Next.js will still optimize it through the Image component

interface DocsSidebarProps {
  docTree?: DocTree;
}

export function DocsSidebar({ docTree }: DocsSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if docTree is valid
  const isValidTree =
    docTree && typeof docTree === "object" && Object.keys(docTree).length > 0;

  // Reinitialize docs if needed
  const handleReinitializeDocs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/docs/init", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize docs: ${response.status}`);
      }

      // Reload the page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error("Error reinitializing docs:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setIsLoading(false);
    }
  };

  return (
    // Only visible on desktop
    <aside className="hidden lg:block w-64 border-r border-[rgb(var(--border))] h-screen overflow-y-auto sticky top-0">
      <div className="p-4 border-b border-[rgb(var(--border))]">
        <Link href="/" className="flex items-center mb-4">
          <Image
            src="/assets/logos/rishi-logo-actual.png"
            alt="Rishi Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[rgb(var(--primary))]">
          <BookOpen className="w-5 h-5" />
          <span>Documentation</span>
        </h3>
      </div>

      <div className="p-4 overflow-y-auto">
        {!isValidTree ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Documentation tree is empty
                  </p>
                  <p className="text-xs mt-1">
                    No documentation structure was found or loaded.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleReinitializeDocs}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-md transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Reinitializing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Reinitialize Documentation</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-xs text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Try refreshing the page or navigating to a specific document.
              </p>
              <div className="mt-2 space-y-1">
                <Link
                  href="/docs"
                  className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Documentation Home
                </Link>
                <Link
                  href="/docs/api"
                  className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  API Documentation
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <TableOfContents tree={docTree} />
        )}
      </div>
    </aside>
  );
}
