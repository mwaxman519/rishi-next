"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

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
            method: "GET",
            headers: {
              Accept: "application/json",
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
    const linkElement = document.createElement("link");
    linkElement.rel = "prefetch";
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
