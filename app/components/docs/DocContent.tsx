&quot;use client&quot;;

import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { ChevronRight, Clock } from &quot;lucide-react&quot;;
import { InDocumentToc } from &quot;./in-document-toc&quot;;
import {
  createBreadcrumbsFromPath,
  formatDisplayDate,
} from &quot;../../lib/client-utils&quot;;
import type { DocMetadata } from &quot;../../lib/docs&quot;;

interface DocContentProps {
  content: React.ReactNode;
  metadata: DocMetadata;
  currentPath: string;
}

export function DocContent({
  content,
  metadata,
  currentPath,
}: DocContentProps) {
  // Generate breadcrumbs
  const breadcrumbs = createBreadcrumbsFromPath(currentPath);

  return (
    <div key=&quot;doc-content-wrapper&quot; className=&quot;relative min-h-screen&quot;>
      {/* Elegant Hero Section with Breadcrumbs */}
      <div className=&quot;bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-700/50&quot;>
        <div className=&quot;max-w-7xl mx-auto px-8 py-8&quot;>
          {/* Sophisticated Breadcrumbs */}
          <nav key=&quot;breadcrumbs-nav&quot; className=&quot;mb-6&quot;>
            <ol className=&quot;flex flex-wrap items-center&quot;>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`crumb-${index}-${crumb.path}`}>
                  {index > 0 && (
                    <li key={`separator-${index}`} className=&quot;mx-3&quot;>
                      <ChevronRight className=&quot;h-4 w-4 text-slate-400 dark:text-slate-500&quot; />
                    </li>
                  )}
                  <li key={`crumb-item-${index}`}>
                    {index < breadcrumbs.length - 1 ? (
                      <Link
                        href={crumb.path}
                        className=&quot;group flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/50 transition-all duration-200 shadow-sm hover:shadow-md&quot;
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className=&quot;flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-900 dark:text-white bg-white/80 dark:bg-slate-700/50 shadow-sm&quot;>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Document Title Section */}
          <div className=&quot;space-y-4&quot;>
            <h1 className=&quot;text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight&quot;>
              {metadata.title || breadcrumbs[breadcrumbs.length - 1]?.label || 'Documentation'}
            </h1>
            {metadata.description && (
              <p className=&quot;text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed&quot;>
                {metadata.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className=&quot;max-w-7xl mx-auto px-8 py-12&quot;>
        <div className=&quot;flex flex-col lg:flex-row gap-12&quot;>
          {/* Document Content */}
          <article className=&quot;flex-1 min-w-0&quot;>
            <div className=&quot;prose prose-slate max-w-none dark:prose-invert
              prose-headings:scroll-mt-20 prose-headings:font-bold
              prose-h1:text-4xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b prose-h1:border-slate-200 dark:prose-h1:border-slate-700
              prose-h1:bg-gradient-to-r prose-h1:from-slate-900 prose-h1:to-slate-700 dark:prose-h1:from-white dark:prose-h1:to-slate-300 prose-h1:bg-clip-text prose-h1:text-transparent
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-slate-900 dark:prose-h2:text-white
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-slate-800 dark:prose-h3:text-slate-200
              prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-slate-700 dark:prose-h4:text-slate-300
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all
              prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-semibold
              prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:text-slate-800 dark:prose-code:text-slate-200
              prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-medium
              prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
              prose-pre:rounded-xl prose-pre:p-6 prose-pre:shadow-xl
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/20
              prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:my-8
              prose-ul:space-y-2 prose-ol:space-y-2
              prose-li:text-slate-700 dark:prose-li:text-slate-300
              prose-table:border-collapse prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700
              prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700
              prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-left
              prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:px-4 prose-td:py-3
              prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-700
              prose-hr:border-slate-200 dark:prose-hr:border-slate-700 prose-hr:my-12&quot;>
              {content}
            </div>
          </article>

          {/* Floating Table of Contents */}
          <aside className=&quot;hidden lg:block w-80 shrink-0&quot;>
            <div className=&quot;sticky top-8 space-y-6&quot;>
              <div className=&quot;bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300&quot;>
                <div className=&quot;flex items-center gap-3 mb-4&quot;>
                  <div className=&quot;w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500&quot;></div>
                  <h4 className=&quot;text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider&quot;>
                    On This Page
                  </h4>
                </div>
                <InDocumentToc />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Elegant Footer */}
      <footer className=&quot;mt-20 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-800&quot;>
        <div className=&quot;max-w-7xl mx-auto px-8 py-12&quot;>
          <div className=&quot;flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0&quot;>
            {/* Last Updated Info */}
            <div className=&quot;flex items-center space-x-4&quot;>
              <div className=&quot;flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg&quot;>
                <Clock className=&quot;h-5 w-5 text-white&quot; />
              </div>
              <div>
                <p className=&quot;text-sm text-slate-500 dark:text-slate-400&quot;>Last updated</p>
                <p className=&quot;text-lg font-semibold text-slate-900 dark:text-white&quot;>
                  {metadata.lastUpdated
                    ? formatDisplayDate(metadata.lastUpdated)
                    : &quot;Recently&quot;}
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
              <Link
                href=&quot;#&quot;
                className=&quot;group flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md&quot;
              >
                <svg
                  className=&quot;w-5 h-5 transition-transform group-hover:scale-110&quot;
                  fill=&quot;none&quot;
                  viewBox=&quot;0 0 24 24&quot;
                  stroke=&quot;currentColor&quot;
                >
                  <path
                    strokeLinecap=&quot;round&quot;
                    strokeLinejoin=&quot;round&quot;
                    strokeWidth=&quot;2&quot;
                    d=&quot;M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z&quot;
                  />
                </svg>
                Edit this page
              </Link>
              <Link
                href=&quot;#&quot;
                className=&quot;group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl&quot;
              >
                <svg
                  className=&quot;w-5 h-5 transition-transform group-hover:scale-110&quot;
                  fill=&quot;none&quot;
                  viewBox=&quot;0 0 24 24&quot;
                  stroke=&quot;currentColor&quot;
                >
                  <path
                    strokeLinecap=&quot;round&quot;
                    strokeLinejoin=&quot;round&quot;
                    strokeWidth=&quot;2&quot;
                    d=&quot;M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z&quot;
                  />
                </svg>
                Report an issue
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
