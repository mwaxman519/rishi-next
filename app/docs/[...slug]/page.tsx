import { notFound } from &quot;next/navigation&quot;;
import { redirect } from &quot;next/navigation&quot;;
import { getDocTree, getDocumentByPath, getAllDocs } from &quot;../../lib/docs&quot;;
import { shouldSkipDocsGeneration, getAllDocsProduction } from &quot;../../lib/docs-production&quot;;
import { DOC_PATH_REDIRECTS } from &quot;../../lib/doc-redirects&quot;;

// Import components using named imports
import { DocContent } from &quot;../../components/docs/DocContent&quot;;
import { DocsSidebar } from &quot;../../components/docs/DocsSidebar&quot;;
import { DocsMobileButton } from &quot;../../components/docs/DocsMobileButton&quot;;

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Use ISR (Incremental Static Regeneration) with revalidation
export const revalidate = 86400; // Revalidate every 24 hours

// Add HTTP Cache-Control headers using generateMetadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  return {
    other: {
      &quot;Cache-Control&quot;:
        &quot;public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800&quot;,
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;

  // Join the slug array into a path
  const docPath = slug.join(&quot;/&quot;);

  // Log path for debugging
  console.log(`[DOCS PAGE] Loading document page for path: ${docPath}`);
  console.log(`[DOCS PAGE] Original slug array:`, slug);



  // Special handling for specific paths with known issues
  if (
    docPath === &quot;business/user-requirements&quot; ||
    docPath === &quot;business/user-requirements.md&quot;
  ) {
    console.log(`[DOCS PAGE] Special case redirect for ${docPath}`);
    // Return redirect instead of using it directly
    return redirect(&quot;/docs/business/requirements/user-requirements&quot;);
  }

  try {
    // Check if we should redirect this path based on our central redirects
    const normalizedPath = docPath.replace(/\.(md|mdx)$/i, "&quot;);
    if (DOC_PATH_REDIRECTS[normalizedPath]) {
      const redirectTarget = DOC_PATH_REDIRECTS[normalizedPath];
      console.log(
        `[DOCS PAGE] Redirecting from ${normalizedPath} to ${redirectTarget}`,
      );
      // Return redirect instead of using it directly
      return redirect(`/docs/${redirectTarget}`);
    }

    // Get the document tree using our centralized utility function
    const docTree = await getDocTree();

    if (!docTree || Object.keys(docTree).length === 0) {
      throw new Error(
        &quot;Documentation tree is empty or invalid - no documentation files were found&quot;,
      );
    }

    console.log(
      `[DOCS PAGE] Successfully loaded document tree with ${Object.keys(docTree).length} root entries`,
    );

    // Add debugging info for the path
    console.log(
      `[DOCS PAGE DEBUG] Requesting document with path: '${docPath}'`,
    );

    // Get document content using our centralized utility function
    // docPath should NOT include any extension at this point
    const doc = await getDocumentByPath(docPath);

    // If document not found, handle gracefully based on environment
    if (!doc) {
      // Try to find a README file in this directory
      const readmePath = `${docPath}/README`;
      
      try {
        const readmeDoc = await getDocumentByPath(readmePath);
        if (readmeDoc) {
          console.log(`[DOCS PAGE] Redirecting from ${docPath} to ${readmePath}`);
          return redirect(`/docs/${readmePath}`);
        }
      } catch (readmeError) {
        // Ignore readme lookup errors
      }

      // If it&apos;s a directory path without README, try to find any document in that directory
      try {
        const allDocs = await getAllDocs();
        const directoryDocs = allDocs.filter(d => d.path.startsWith(docPath + '/'));
        
        if (directoryDocs.length > 0) {
          // Redirect to the first document in the directory
          const firstDoc = directoryDocs[0];
          console.log(`[DOCS PAGE] Redirecting from ${docPath} to ${firstDoc.path}`);
          return redirect(`/docs/${firstDoc.path}`);
        }
      } catch (redirectError) {
        // Ignore redirect lookup errors in production
        if (process.env.NODE_ENV === 'development') {
          console.error(`[DOCS PAGE] Error checking directory redirect: ${redirectError}`);
        }
      }

      // For production builds, throw an error that can be caught
      if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
        throw new Error(`NEXT_HTTP_ERROR_FALLBACK;404`);
      }

      // Development mode - log and use notFound
      console.error(`[DOCS PAGE] Document not found: ${docPath}`);
      notFound();
    }

    console.log(`[DOCS PAGE] Successfully loaded document: ${docPath}`);

    // Use the standard layout but with additional sidebars for docs
    // Cache-Control headers will be added via generateMetadata

    return (
      <div className=&quot;flex&quot;>
        {/* Left sidebar - doc tree, only visible on desktop */}
        <DocsSidebar docTree={docTree} />

        {/* Main content - now with enhanced caching */}
        <div className=&quot;flex-1 min-w-0&quot;>
          {/* Include the cached version */}
          <DocContent
            content={doc.content}
            metadata={doc.metadata}
            currentPath={`/docs/${docPath}`}
          />
        </div>

        {/* Client-side Mobile docs tree button for the header */}
        <DocsMobileButton docTree={docTree} />
      </div>
    );
  } catch (error) {
    console.error(`[DOCS PAGE] Error loading document:`, error);
    console.error(
      `[DOCS PAGE] Error details:`,
      error instanceof Error ? error.message : String(error),
    );
    throw error; // This will trigger the error.tsx boundary
  }
}

// Generate static paths for all documents - only for documents that actually exist
export async function generateStaticParams() {
  // Check if we should skip docs generation entirely
  if (shouldSkipDocsGeneration()) {
    console.log(&quot;[DOCS generateStaticParams] Skipping all docs generation in production&quot;);
    return [];
  }

  try {
    // Get all actual documents using production-safe method
    const allDocs = await getAllDocsProduction();
    
    if (allDocs.length === 0) {
      console.log(&quot;[DOCS generateStaticParams] No documents found, returning minimal paths&quot;);
      return [];
    }

    const paths: { slug: string[] }[] = [];

    // Generate paths only for documents that actually exist and are valid
    for (const doc of allDocs) {
      // Skip documents that don&apos;t have valid paths
      if (!doc.path || doc.path.trim() === '' || doc.path.includes('..')) continue;
      
      // Convert path to slug array (remove any .md extension)
      const pathWithoutExt = doc.path.replace(/\.(md|mdx)$/i, '');
      const slug = pathWithoutExt.split('/').filter(segment => 
        segment.length > 0 && 
        !segment.startsWith('.') && 
        segment !== 'node_modules'
      );
      
      // Only add valid paths
      if (slug.length > 0) {
        paths.push({ slug });
      }
    }

    // Log the result with better debugging
    console.log(
      `[DOCS generateStaticParams] Generated ${paths.length} static paths from ${allDocs.length} documents`,
    );
    
    if (paths.length > 0) {
      console.log(`[DOCS generateStaticParams] Sample paths:`, paths.slice(0, 5).map(p => p.slug.join('/')));
    }

    return paths;
  } catch (error) {
    // During build time, log error but don&apos;t fail the build
    console.error(
      &quot;[DOCS generateStaticParams] Error generating paths during build:",
      error,
    );

    // Return empty array to avoid generating invalid paths
    return [];
  }
}
