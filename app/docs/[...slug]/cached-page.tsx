&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { DocContent } from &quot;../../components/docs/DocContent&quot;;
import { CachedDocumentLoader } from &quot;../../components/docs/cached-document-loader&quot;;

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
    if (typeof window !== &quot;undefined&quot;) {
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
      <div className=&quot;w-full overflow-hidden&quot;>
        <div className=&quot;max-w-3xl mx-auto px-4 py-6&quot;>
          <DocContent content={content} metadata={metadata} />
        </div>
      </div>
    </CachedDocumentLoader>
  );
}
