&quot;use client&quot;;

import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { ChevronRight, Clock } from &quot;lucide-react&quot;;
import { InDocumentToc } from &quot;./in-document-toc&quot;;
import {
  createBreadcrumbsFromPath,
  formatDisplayDate,
} from &quot;@/components/../lib/client-utils&quot;;
import type { DocMetadata } from &quot;@/components/../lib/docs&quot;;

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
    <div key=&quot;doc-content-wrapper&quot; className=&quot;relative max-w-7xl mx-auto p-6&quot;>
      {/* Breadcrumbs */}
      <nav key=&quot;breadcrumbs-nav&quot; className=&quot;mb-8&quot;>
        <ol className=&quot;flex flex-wrap items-center text-sm text-[rgb(var(--muted-foreground))]&quot;>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`crumb-${index}-${crumb.path}`}>
              {index > 0 && (
                <li key={`separator-${index}`} className=&quot;mx-2&quot;>
                  <ChevronRight className=&quot;h-4 w-4&quot; />
                </li>
              )}
              <li key={`crumb-item-${index}`}>
                {index < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.path}
                    className=&quot;hover:text-[rgb(var(--primary))] transition-colors&quot;
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className=&quot;font-medium text-[rgb(var(--foreground))]&quot;>
                    {crumb.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      {/* Main content with floating TOC */}
      <div className=&quot;flex flex-col lg:flex-row justify-between&quot;>
        {/* Document content */}
        <article className=&quot;prose prose-gray max-w-full lg:max-w-2xl dark:prose-invert prose-headings:bg-gradient-to-r prose-headings:from-purple-700 prose-headings:to-teal-600 prose-headings:bg-clip-text prose-headings:text-transparent dark:prose-headings:from-purple-400 dark:prose-headings:to-teal-300 prose-a:text-purple-600 dark:prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-code:bg-purple-50 prose-code:text-purple-800 dark:prose-code:bg-purple-900/30 dark:prose-code:text-teal-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-[''] prose-code:after:content-['']&quot;>
          {content}
        </article>

        {/* Floating In-document TOC - only visible on desktop */}
        <div className=&quot;hidden lg:block sticky top-10 mt-16 self-start w-64 ml-8&quot;>
          <div className=&quot;bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4 shadow-sm&quot;>
            <h4 className=&quot;text-sm font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-3&quot;>
              On This Page
            </h4>
            <InDocumentToc />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className=&quot;mt-16 pt-8 border-t border-[rgb(var(--border))] text-sm text-[rgb(var(--muted-foreground))]&quot;>
        <div className=&quot;flex flex-col md:flex-row justify-between items-start md:items-center mb-8&quot;>
          <div className=&quot;flex items-center&quot;>
            <div className=&quot;w-5 h-5 rounded-full bg-[rgba(var(--primary),0.15)] flex items-center justify-center mr-2&quot;>
              <Clock className=&quot;h-3 w-3 text-[rgb(var(--primary))]&quot; />
            </div>
            <p>
              Last updated:{&quot; &quot;}
              <span className=&quot;font-medium text-[rgb(var(--foreground))]&quot;>
                {metadata.lastUpdated
                  ? formatDisplayDate(metadata.lastUpdated)
                  : &quot;Unknown&quot;}
              </span>
            </p>
          </div>
          <div className=&quot;mt-4 md:mt-0 flex space-x-6&quot;>
            <Link
              href=&quot;#&quot;
              className=&quot;flex items-center text-[rgb(var(--primary))] hover:underline&quot;
            >
              <svg
                className=&quot;w-4 h-4 mr-1.5&quot;
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
              className=&quot;flex items-center text-[rgb(var(--secondary))] hover:underline&quot;
            >
              <svg
                className=&quot;w-4 h-4 mr-1.5&quot;
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
      </footer>
    </div>
  );
}
