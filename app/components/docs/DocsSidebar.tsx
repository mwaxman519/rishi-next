"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, RefreshCw, AlertTriangle } from "lucide-react";
import { TableOfContents } from "./table-of-contents";
import type { DocTree } from "../../lib/docs";

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
    // Only visible on desktop - Professional Elegant Sidebar
    <aside className="hidden lg:block w-96 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-slate-200/50 dark:border-slate-700/50 h-screen overflow-y-auto sticky top-0 shadow-2xl backdrop-blur-sm">
      {/* Stunning Header Section */}
      <div className="p-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Link href="/" className="group flex items-center mb-6 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:shadow-xl transition-all duration-300">
            <Image
              src="/favicon.ico"
              alt="Rishi Logo"
              width={24}
              height={24}
              className="w-6 h-6 filter brightness-0 invert"
              priority
            />
          </div>
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Rishi Platform
          </span>
        </Link>
        
        {/* Professional Documentation Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Documentation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Comprehensive guides & API references
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="p-6 overflow-y-auto">
        {!isValidTree ? (
          <div className="space-y-6">
            {/* Professional Error Display */}
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Documentation Loading
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    The documentation structure is being prepared. This may take a moment.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Action Button */}
            <button
              onClick={handleReinitializeDocs}
              disabled={isLoading}
              className="w-full group flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Initializing Documentation...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Reload Documentation</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 shadow-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                      Error Loading Documentation
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                      {error}
                    </p>
                  </div>
                </div>
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
