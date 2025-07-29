"use client";

import { useEffect } from "react";
import { DocContent } from "../../components/docs/DocContent";
import { CachedDocumentLoader } from "../../components/docs/cached-document-loader";

interface CachedDocPageProps {
  docPath: string;
  content: React.ReactNode;
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
    lastUpdated?: string;
  };
}

export default function CachedDocPage({
  docPath,
  content,
  metadata,
}: CachedDocPageProps) {
  // This client-side component adds HTTP and browser caching

  useEffect(() => {
    // Add page to browser history for improved navigation
    if (typeof window !== "undefined") {
      const title = metadata.title || null;
      window.history.replaceState(
        { docPath, title },
        title,
        `/docs/${docPath}`,
      );

      // Set page title dynamically
      document.title = `${title} | Rishi Documentation`;
    }

    // Log cache information
    console.log(`[DOCS] Loaded cached document: ${docPath}`);
  }, [docPath, metadata]);

  return (
    <CachedDocumentLoader path={docPath}>
      <div className="w-full overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <DocContent content={content} metadata={metadata} />
        </div>
      </div>
    </CachedDocumentLoader>
  );
}
