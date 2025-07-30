&quot;use client&quot;;

import React, { useEffect, useState } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;
import { BookOpen, RefreshCw, AlertTriangle } from &quot;lucide-react&quot;;
import { TableOfContents } from &quot;./table-of-contents&quot;;
import type { DocTree } from &quot;../../lib/docs&quot;;

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
    // Only visible on desktop - Professional Elegant Sidebar
    <aside className=&quot;hidden lg:block w-96 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-slate-200/50 dark:border-slate-700/50 h-screen overflow-y-auto sticky top-0 shadow-2xl backdrop-blur-sm&quot;>
      {/* Stunning Header Section */}
      <div className=&quot;p-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900&quot;>
        <Link href=&quot;/&quot; className=&quot;group flex items-center mb-6 transition-all duration-300 hover:scale-105&quot;>
          <div className=&quot;flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:shadow-xl transition-all duration-300&quot;>
            <Image
              src=&quot;/favicon.ico&quot;
              alt=&quot;Rishi Logo&quot;
              width={24}
              height={24}
              className=&quot;w-6 h-6 filter brightness-0 invert&quot;
              priority
            />
          </div>
          <span className=&quot;ml-3 text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent&quot;>
            Rishi Platform
          </span>
        </Link>
        
        {/* Professional Documentation Header */}
        <div className=&quot;flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg&quot;>
          <div className=&quot;flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg&quot;>
            <BookOpen className=&quot;w-6 h-6 text-white&quot; />
          </div>
          <div>
            <h3 className=&quot;text-xl font-bold text-slate-900 dark:text-white&quot;>
              Documentation
            </h3>
            <p className=&quot;text-sm text-slate-600 dark:text-slate-400&quot;>
              Comprehensive guides & API references
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className=&quot;p-6 overflow-y-auto&quot;>
        {!isValidTree ? (
          <div className=&quot;space-y-6&quot;>
            {/* Professional Error Display */}
            <div className=&quot;p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl shadow-lg&quot;>
              <div className=&quot;flex items-start gap-4&quot;>
                <div className=&quot;flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg&quot;>
                  <AlertTriangle className=&quot;h-5 w-5 text-white&quot; />
                </div>
                <div>
                  <h4 className=&quot;text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2&quot;>
                    Documentation Loading
                  </h4>
                  <p className=&quot;text-sm text-amber-800 dark:text-amber-300&quot;>
                    The documentation structure is being prepared. This may take a moment.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Action Button */}
            <button
              onClick={handleReinitializeDocs}
              disabled={isLoading}
              className=&quot;w-full group flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none&quot;
            >
              {isLoading ? (
                <>
                  <RefreshCw className=&quot;h-5 w-5 animate-spin&quot; />
                  <span>Initializing Documentation...</span>
                </>
              ) : (
                <>
                  <RefreshCw className=&quot;h-5 w-5 group-hover:rotate-180 transition-transform duration-300&quot; />
                  <span>Reload Documentation</span>
                </>
              )}
            </button>

            {error && (
              <div className=&quot;p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg&quot;>
                <div className=&quot;flex items-start gap-4&quot;>
                  <div className=&quot;flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 shadow-lg&quot;>
                    <AlertTriangle className=&quot;h-5 w-5 text-white&quot; />
                  </div>
                  <div>
                    <h4 className=&quot;text-lg font-semibold text-red-900 dark:text-red-100 mb-2&quot;>
                      Error Loading Documentation
                    </h4>
                    <p className=&quot;text-sm text-red-800 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg&quot;>
                      {error}
                    </p>
                  </div>
                </div>
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
                >
                  Documentation Home
                </Link>
                <Link
                  href=&quot;/docs/api&quot;
                  className=&quot;block text-xs text-blue-600 dark:text-blue-400 hover:underline&quot;
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
