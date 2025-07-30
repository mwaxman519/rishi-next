&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { X, BookOpen, RefreshCw, AlertTriangle } from &quot;lucide-react&quot;;
import { TableOfContents } from &quot;./table-of-contents&quot;;
import type { DocTree } from &quot;../../lib/docs&quot;;
import Link from &quot;next/link&quot;;

interface MobileDocsButtonProps {
  docTree?: DocTree;
}

export function MobileDocsButton({ docTree }: MobileDocsButtonProps) {
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if docTree is valid
  const isValidTree =
    docTree && typeof docTree === &quot;object&quot; && Object.keys(docTree).length > 0;

  // Component hydration check for smoother SSR transitions
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle clicking outside to close the menu
  useEffect(() => {
    if (!mobileDocsOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains(&quot;mobile-docs-overlay&quot;)) {
        setMobileDocsOpen(false);
      }
    };

    document.addEventListener(&quot;click&quot;, handleClickOutside);
    return () => document.removeEventListener(&quot;click&quot;, handleClickOutside);
  }, [mobileDocsOpen]);

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

  // Don't render anything during SSR to prevent hydration issues
  if (!isClient) return null;

  return (
    <>
      {/* Mobile Docs Button - Fixed at top header */}
      <button
        onClick={() => setMobileDocsOpen(true)}
        className=&quot;lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-[rgb(var(--primary))] text-white shadow-md&quot;
        aria-label=&quot;Show documentation tree&quot;
      >
        <BookOpen size={18} />
      </button>

      {/* Mobile Docs Overlay */}
      {mobileDocsOpen && (
        <div
          className=&quot;fixed inset-0 bg-black/50 z-40 lg:hidden mobile-docs-overlay&quot;
          onClick={() => setMobileDocsOpen(false)}
        ></div>
      )}

      {/* Mobile Docs Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-950 shadow-lg 
          transition-transform duration-300 transform lg:hidden overflow-hidden
          ${mobileDocsOpen ? &quot;translate-x-0&quot; : &quot;translate-x-full&quot;}
        `}
      >
        {/* Mobile docs header */}
        <div className=&quot;flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900&quot;>
          <h3 className=&quot;font-bold text-[rgb(var(--primary))]&quot;>
            Documentation
          </h3>
          <button
            onClick={() => setMobileDocsOpen(false)}
            className=&quot;p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50&quot;
            aria-label=&quot;Close docs menu&quot;
          >
            <X size={20} />
          </button>
        </div>

        {/* Documentation Tree */}
        <div className=&quot;p-3 overflow-y-auto max-h-[calc(100vh-64px)]&quot;>
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
