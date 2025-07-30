import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { DocsHomePage } from &quot;../components/docs/DocsHomePage&quot;;
import { DocsSidebar } from &quot;../components/docs/DocsSidebar&quot;;
import { MobileDocsButton } from &quot;../components/docs/MobileDocsButton&quot;;
import { AlertTriangle, Bug, ChevronLeft } from &quot;lucide-react&quot;;
import { getDocTree, getRecentDocuments, DOCS_DIRECTORY } from &quot;../lib/docs&quot;;

// Error UI component for detailed error display
function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className=&quot;p-8 max-w-4xl mx-auto&quot;>
      <div className=&quot;bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6&quot;>
        <div className=&quot;flex items-start gap-4&quot;>
          <div className=&quot;text-red-600 dark:text-red-400&quot;>
            <AlertTriangle className=&quot;h-6 w-6&quot; />
          </div>
          <div>
            <h3 className=&quot;text-lg font-semibold text-red-700 dark:text-red-300 mb-2&quot;>
              Documentation System Error
            </h3>
            <div className=&quot;text-sm text-red-600 dark:text-red-400 mb-4&quot;>
              <p>An error occurred while loading the documentation system:</p>
              <p className=&quot;font-mono bg-red-100 dark:bg-red-900/30 p-2 mt-2 rounded overflow-auto&quot;>
                {error.message}
              </p>
              {error.stack && (
                <details className=&quot;mt-4&quot;>
                  <summary className=&quot;cursor-pointer&quot;>Stack Trace</summary>
                  <pre className=&quot;text-xs bg-red-100 dark:bg-red-900/30 p-2 mt-2 rounded overflow-auto&quot;>
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
            <div className=&quot;space-y-2&quot;>
              <Link
                href=&quot;/&quot;
                className=&quot;flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline&quot;
              >
                <ChevronLeft className=&quot;h-4 w-4&quot; />
                Return to Home
              </Link>
              <Link
                href=&quot;/simple-docs&quot;
                className=&quot;flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline&quot;
              >
                <Bug className=&quot;h-4 w-4&quot; />
                Try Simple Documentation Viewer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This is a server component to fetch the document tree
// Disable static generation for docs in production
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DocsPage() {
  try {
    console.log(&quot;[DOCS PAGE] Starting with direct filesystem access approach&quot;);



    // Get the document tree and recent documents using our centralized utility functions
    let docTree;
    let recentDocuments = [];
    
    try {
      docTree = await getDocTree();
      recentDocuments = await getRecentDocuments(10); // Show up to 10 recent docs
    } catch (docError) {
      console.error(&quot;[DOCS PAGE] Error loading documentation:&quot;, docError);
      // Re-throw the error to properly handle it
      throw docError;
    }

    // Documentation should always be available - if tree is empty, there&apos;s a technical issue
    if (!docTree || Object.keys(docTree).length === 0) {
      throw new Error(&quot;Documentation tree is empty - this indicates a technical issue that needs to be resolved&quot;);
    }

    console.log(
      `[DOCS PAGE] Successfully loaded documentation from: ${DOCS_DIRECTORY}`,
    );
    console.log(
      `[DOCS PAGE] Found ${recentDocuments.length} documents and built tree with ${Object.keys(docTree).length} root items`,
    );

    // Wrap data in a key to force complete re-render when data changes
    return (
      <div className=&quot;flex&quot;>
        {/* Doc tree sidebar - only visible on desktop */}
        <DocsSidebar docTree={docTree} />

        {/* Main content */}
        <div className=&quot;flex-1 min-w-0&quot;>
          <DocsHomePage
            key=&quot;docs-home&quot;
            docTree={docTree}
            recentDocuments={recentDocuments}
          />
        </div>

        {/* Mobile Docs Button - only visible on mobile */}
        <MobileDocsButton docTree={docTree} />
      </div>
    );
  } catch (error) {
    console.error(&quot;[DOCS PAGE] Error rendering docs page:&quot;, error);

    // Cast to Error type for proper display
    const typedError =
      error instanceof Error ? error : new Error(String(error));

    // Return error UI
    return <ErrorDisplay error={typedError} />;
  }
}
