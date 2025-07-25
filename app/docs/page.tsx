import React from "react";
import Link from "next/link";
import { DocsHomePage } from "../components/docs/DocsHomePage";
import { DocsSidebar } from "../components/docs/DocsSidebar";
import { MobileDocsButton } from "../components/docs/MobileDocsButton";
import { AlertTriangle, Bug, ChevronLeft } from "lucide-react";
import { getDocTree, getRecentDocuments, DOCS_DIRECTORY } from "../lib/docs";

// Error UI component for detailed error display
function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
              Documentation System Error
            </h3>
            <div className="text-sm text-red-600 dark:text-red-400 mb-4">
              <p>An error occurred while loading the documentation system:</p>
              <p className="font-mono bg-red-100 dark:bg-red-900/30 p-2 mt-2 rounded overflow-auto">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs bg-red-100 dark:bg-red-900/30 p-2 mt-2 rounded overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ChevronLeft className="h-4 w-4" />
                Return to Home
              </Link>
              <Link
                href="/simple-docs"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Bug className="h-4 w-4" />
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
    console.log("[DOCS PAGE] Starting with direct filesystem access approach");



    // Get the document tree and recent documents using our centralized utility functions
    let docTree;
    let recentDocuments = [];
    
    try {
      docTree = await getDocTree();
      recentDocuments = await getRecentDocuments(10); // Show up to 10 recent docs
    } catch (docError) {
      console.error("[DOCS PAGE] Error loading documentation:", docError);
      // Re-throw the error to properly handle it
      throw docError;
    }

    // Documentation should always be available - if tree is empty, there's a technical issue
    if (!docTree || Object.keys(docTree).length === 0) {
      throw new Error("Documentation tree is empty - this indicates a technical issue that needs to be resolved");
    }

    console.log(
      `[DOCS PAGE] Successfully loaded documentation from: ${DOCS_DIRECTORY}`,
    );
    console.log(
      `[DOCS PAGE] Found ${recentDocuments.length} documents and built tree with ${Object.keys(docTree).length} root items`,
    );

    // Wrap data in a key to force complete re-render when data changes
    return (
      <div className="flex">
        {/* Doc tree sidebar - only visible on desktop */}
        <DocsSidebar docTree={docTree} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <DocsHomePage
            key="docs-home"
            docTree={docTree}
            recentDocuments={recentDocuments}
          />
        </div>

        {/* Mobile Docs Button - only visible on mobile */}
        <MobileDocsButton docTree={docTree} />
      </div>
    );
  } catch (error) {
    console.error("[DOCS PAGE] Error rendering docs page:", error);

    // Cast to Error type for proper display
    const typedError =
      error instanceof Error ? error : new Error(String(error));

    // Return error UI
    return <ErrorDisplay error={typedError} />;
  }
}
