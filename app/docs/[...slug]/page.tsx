import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getDocTree, getDocumentByPath, getAllDocs } from "../../lib/docs";
import { DOC_PATH_REDIRECTS } from "../../lib/doc-redirects";

// Import components using named imports
import { DocContent } from "../../components/docs/DocContent";
import { DocsSidebar } from "../../components/docs/DocsSidebar";
import { DocsMobileButton } from "../../components/docs/DocsMobileButton";

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
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;

  // Join the slug array into a path
  const docPath = slug.join("/");

  // Log path for debugging
  console.log(`[DOCS PAGE] Loading document page for path: ${docPath}`);
  console.log(`[DOCS PAGE] Original slug array:`, slug);

  // Special handling for specific paths with known issues
  if (
    docPath === "business/user-requirements" ||
    docPath === "business/user-requirements.md"
  ) {
    console.log(`[DOCS PAGE] Special case redirect for ${docPath}`);
    // Return redirect instead of using it directly
    return redirect("/docs/business/requirements/user-requirements");
  }

  try {
    // Check if we should redirect this path based on our central redirects
    const normalizedPath = docPath.replace(/\.(md|mdx)$/i, "");
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
        "Documentation tree is empty or invalid - no documentation files were found",
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

    // If document not found, check if it's a directory path that should redirect to README
    if (!doc) {
      // Try to find a README file in this directory
      const readmePath = `${docPath}/README`;
      const readmeDoc = await getDocumentByPath(readmePath);
      
      if (readmeDoc) {
        console.log(`[DOCS PAGE] Redirecting from ${docPath} to ${readmePath}`);
        return redirect(`/docs/${readmePath}`);
      }

      // If it's a directory path without README, try to find any document in that directory
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
        console.error(`[DOCS PAGE] Error checking directory redirect: ${redirectError}`);
      }

      // Document truly not found - only log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[DOCS PAGE] Document not found: ${docPath}`);
        console.error(`[DOCS PAGE] Attempted to load document at: ${docPath}`);
      }

      notFound();
    }

    console.log(`[DOCS PAGE] Successfully loaded document: ${docPath}`);

    // Use the standard layout but with additional sidebars for docs
    // Cache-Control headers will be added via generateMetadata

    return (
      <div className="flex">
        {/* Left sidebar - doc tree, only visible on desktop */}
        <DocsSidebar docTree={docTree} />

        {/* Main content - now with enhanced caching */}
        <div className="flex-1 min-w-0">
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

// Generate static paths for all documents - with robust error handling for build time
export async function generateStaticParams() {
  try {
    // Get all actual documents instead of relying on the tree structure
    const allDocs = await getAllDocs();
    const paths: { slug: string[] }[] = [];

    // Generate paths only for documents that actually exist
    for (const doc of allDocs) {
      // Skip documents that don't have valid paths
      if (!doc.path || doc.path.trim() === '') continue;
      
      // Convert path to slug array (remove any .md extension)
      const pathWithoutExt = doc.path.replace(/\.(md|mdx)$/i, '');
      const slug = pathWithoutExt.split('/').filter(segment => segment.length > 0);
      
      // Only add valid paths
      if (slug.length > 0) {
        paths.push({ slug });
      }
    }

    // Also add directory paths for navigation
    const docTree = await getDocTree();
    const addDirectoryPaths = (tree: any, currentPath: string[] = []) => {
      if (!tree || typeof tree !== "object") return;

      for (const [key, value] of Object.entries(tree)) {
        if (typeof value === "object" && value !== null) {
          // This is a directory - add the directory path
          const dirPath = [...currentPath, key];
          paths.push({ slug: dirPath });
          
          // Process children
          addDirectoryPaths(value, dirPath);
        }
      }
    };

    addDirectoryPaths(docTree);

    // Remove duplicates
    const uniquePaths = paths.filter((path, index, self) => 
      index === self.findIndex(p => p.slug.join('/') === path.slug.join('/'))
    );

    // Log the result
    console.log(
      `[DOCS generateStaticParams] Generated ${uniquePaths.length} static paths from ${allDocs.length} documents`,
    );

    return uniquePaths;
  } catch (error) {
    // During build time, we need to handle errors to prevent build failures
    console.error(
      "[DOCS generateStaticParams] Error generating paths during build:",
      error,
    );

    // Return a minimal set of paths to allow the build to succeed
    // These should correspond to actual documentation files
    return [
      { slug: ["README"] },
      { slug: ["api", "README"] },
      { slug: ["architecture", "README"] },
      { slug: ["getting-started", "README"] },
    ];
  }
}
