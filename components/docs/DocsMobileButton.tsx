&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { createPortal } from &quot;react-dom&quot;;
import { X, BookOpen, RefreshCw, AlertTriangle } from &quot;lucide-react&quot;;
import { TableOfContents } from &quot;./table-of-contents&quot;;
import type { DocTree } from &quot;@/components/../lib/docs&quot;;
import Link from &quot;next/link&quot;;

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
    docTree && typeof docTree === &quot;object&quot; && Object.keys(docTree).length > 0;

  // Reinitialize docs if needed
  const handleReinitializeDocs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(&quot;/api/docs/init&quot;, {
        method: &quot;POST&quot;,
        cache: &quot;no-store&quot;,
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize docs: ${response.status}`);
      }

      // Reload the page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error(&quot;Error reinitializing docs:&quot;, err);
      setError(err instanceof Error ? err.message : &quot;Unknown error occurred&quot;);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Docs Button - Fixed in top right header, always visible regardless of docTree */}
      {!hideUntilLoaded && (
        <button
          onClick={() => setMobileDocsOpen(true)}
          className=&quot;lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-[rgb(var(--primary))] text-white shadow-md&quot;
          aria-label=&quot;Show documentation tree&quot;
        >
          <BookOpen size={18} />
        </button>
      )}

      {/* Mobile Docs Overlay */}
      {mobileDocsOpen && (
        <div
          className=&quot;fixed inset-0 bg-black/50 z-40 lg:hidden&quot;
          onClick={() => setMobileDocsOpen(false)}
        ></div>
      )}

      {/* Mobile Docs Panel */}
      <div
        className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-[rgb(var(--sidebar-background))] shadow-lg transition-transform duration-300 transform lg:hidden
        ${mobileDocsOpen ? &quot;translate-x-0&quot; : &quot;translate-x-full&quot;}
      `}
      >
        {/* Mobile docs header */}
        <div className=&quot;flex items-center justify-between p-4 border-b border-[rgb(var(--sidebar-border))]&quot;>
          <h3 className=&quot;font-bold text-[rgb(var(--primary))]&quot;>
            Documentation Tree
          </h3>
          <button
            onClick={() => setMobileDocsOpen(false)}
            className=&quot;p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
            aria-label=&quot;Close docs menu&quot;
          >
            <X size={20} />
          </button>
        </div>

        {/* Documentation Tree */}
        <div className=&quot;px-2 py-4 overflow-y-auto max-h-[calc(100vh-72px)]&quot;>
          {!isValidTree ? (
            <div className=&quot;space-y-4 px-2&quot;>
              <div className=&quot;p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md&quot;>
                <div className=&quot;flex items-start gap-2 text-amber-700 dark:text-amber-400&quot;>
                  <AlertTriangle className=&quot;h-5 w-5 flex-shrink-0&quot; />
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>
                      Documentation tree is empty
                    </p>
                    <p className=&quot;text-xs mt-1&quot;>
                      No documentation structure was found or loaded.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReinitializeDocs}
                disabled={isLoading}
                className=&quot;w-full flex items-center justify-center gap-2 py-2 px-3 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-md transition-colors&quot;
              >
                {isLoading ? (
                  <>
                    <RefreshCw className=&quot;h-4 w-4 animate-spin&quot; />
                    <span>Reinitializing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className=&quot;h-4 w-4&quot; />
                    <span>Reinitialize Documentation</span>
                  </>
                )}
              </button>

              {error && (
                <div className=&quot;p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md&quot;>
                  <p className=&quot;text-xs text-red-700 dark:text-red-400&quot;>
                    {error}
                  </p>
                </div>
              )}

              <div className=&quot;pt-3 border-t border-gray-200 dark:border-gray-800 mt-4&quot;>
                <p className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                  Try refreshing the page or navigating to a specific document.
                </p>
                <div className=&quot;mt-2 space-y-1&quot;>
                  <Link
                    href=&quot;/docs&quot;
                    className=&quot;block text-xs text-blue-600 dark:text-blue-400 hover:underline&quot;
                    onClick={() => setMobileDocsOpen(false)}
                  >
                    Documentation Home
                  </Link>
                  <Link
                    href=&quot;/docs/api&quot;
                    className=&quot;block text-xs text-blue-600 dark:text-blue-400 hover:underline&quot;
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
