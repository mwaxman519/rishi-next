&quot;use client&quot;;

import { useEffect, useState } from &quot;react&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { Loader2 } from &quot;lucide-react&quot;;

interface CachedDocumentLoaderProps {
  children: React.ReactNode;
  path: string;
}

// This component adds caching hints to the browser for documentation pages
export function CachedDocumentLoader({
  children,
  path,
}: CachedDocumentLoaderProps) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Prefetch document metadata to help with caching
    async function prefetchMetadata() {
      try {
        const response = await fetch(
          `/api/docs/cached?path=${encodeURIComponent(path)}`,
          {
            method: &quot;GET&quot;,
            headers: {
              Accept: &quot;application/json&quot;,
            },
          },
        );

        if (response.ok) {
          console.log(`[DOCS] Successfully prefetched metadata for ${path}`);
          setIsPreloaded(true);
        }
      } catch (error) {
        console.error(`[DOCS] Error prefetching metadata for ${path}:`, error);
      }
    }

    prefetchMetadata();
  }, [path]);

  // Preload effect - can be extended with other caching hints
  useEffect(() => {
    // Add link prefetch hints to head
    const linkElement = document.createElement(&quot;link&quot;);
    linkElement.rel = &quot;prefetch&quot;;
    linkElement.href = `/docs/${path}`;
    document.head.appendChild(linkElement);

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(linkElement);
    };
  }, [path]);

  return (
    <>
      {/* You can add a loading indicator here if needed */}
      {children}
    </>
  );
}
