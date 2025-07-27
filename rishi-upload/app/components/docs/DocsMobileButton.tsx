"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, RefreshCw, AlertTriangle } from "lucide-react";
import { TableOfContents } from "./table-of-contents";
import type { DocTree } from "../../lib/docs";
import Link from "next/link";

interface DocsMobileButtonProps {
  docTree?: DocTree;
}

export function DocsMobileButton({ docTree }: DocsMobileButtonProps) {
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideUntilLoaded, setHideUntilLoaded] = useState(true);

  // Use useEffect to ensure component is visible after hydration
  useEffect(() => {
    setHideUntilLoaded(false);
  }, []);

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
    <>
      {/* Mobile Docs Button - Fixed in top right header, always visible regardless of docTree */}
      {!hideUntilLoaded && (
        <button
          onClick={() => setMobileDocsOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-[rgb(var(--primary))] text-white shadow-md"
          aria-label="Show documentation tree"
        >
          <BookOpen size={18} />
        </button>
      )}

      {/* Mobile Docs Overlay */}
      {mobileDocsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileDocsOpen(false)}
        ></div>
      )}

      {/* Mobile Docs Panel */}
      <div
        className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-[rgb(var(--sidebar-background))] shadow-lg transition-transform duration-300 transform lg:hidden
        ${mobileDocsOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Mobile docs header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--sidebar-border))]">
          <h3 className="font-bold text-[rgb(var(--primary))]">
            Documentation Tree
          </h3>
          <button
            onClick={() => setMobileDocsOpen(false)}
            className="p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
            aria-label="Close docs menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Documentation Tree */}
        <div className="px-2 py-4 overflow-y-auto max-h-[calc(100vh-72px)]">
          {!isValidTree ? (
            <div className="space-y-4 px-2">
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
                    onClick={() => setMobileDocsOpen(false)}
                  >
                    Documentation Home
                  </Link>
                  <Link
                    href="/docs/api"
                    className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setMobileDocsOpen(false)}
                  >
                    API Documentation
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <TableOfContents
              tree={docTree}
              onLinkClick={() => setMobileDocsOpen(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
