import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getDocTree, getDocumentByPath, getAllDocs } from "../../lib/docs";
import { DOC_PATH_REDIRECTS } from "../../lib/doc-redirects";

// Import components using named imports
import { DocContent } from "../../components/docs/DocContent";
import { DocsSidebar } from "../../components/docs/DocsSidebar";
import { DocsMobileButton } from "../../components/docs/DocsMobileButton";

interface DocPageProps {
  params: {
    slug: string[];
  };
}

// Use ISR (Incremental Static Regeneration) with revalidation
export const revalidate = 86400; // Revalidate every 24 hours

// Add HTTP Cache-Control headers using generateMetadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
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

    // If document not found, log details and use Next.js notFound()
    if (!doc) {
      console.error(`[DOCS PAGE] Document not found: ${docPath}`);
      console.error(`[DOCS PAGE] Attempted to load document at: ${docPath}`);

      // Try to list any similar paths for debugging
      try {
        const allDocs = await getAllDocs();
        const possibleMatches = allDocs
          .filter((d) => d.path.includes(docPath) || docPath.includes(d.path))
          .map((d) => d.path);

        if (possibleMatches.length > 0) {
          console.error(
            `[DOCS PAGE] Similar documents found: ${possibleMatches.join(", ")}`,
          );
        }
      } catch (matchError) {
        console.error(
          `[DOCS PAGE] Error checking similar documents: ${matchError}`,
        );
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

// Generate static paths for all documents - with minimal error handling for build time
export async function generateStaticParams() {
  try {
    // Get the document tree using our centralized utility function
    const docTree = await getDocTree();
    const paths: { slug: string[] }[] = [];

    // Helper function to traverse the document tree and collect paths
    const traverseTree = (tree: any, currentPath: string[] = []) => {
      if (!tree || typeof tree !== "object") return;

      for (const [key, value] of Object.entries(tree)) {
        if (value === null) {
          // This is a document file - use just the filename without extension for the slug
          const filenameNoExt = key.replace(/\.[^/.]+$/, "");

          // For README files, we create two routes:
          // 1. The directory path (e.g., /docs/api)
          // 2. The explicit file path (e.g., /docs/api/README)
          if (filenameNoExt === "README") {
            // The directory path will already be added by the directory handling below
            // Just add the explicit README path
            paths.push({ slug: [...currentPath, filenameNoExt] });
          } else {
            // Add regular file path
            paths.push({ slug: [...currentPath, filenameNoExt] });
          }
        } else if (typeof value === "object") {
          // This is a directory - add the directory path
          paths.push({ slug: [...currentPath, key] });

          // Process children
          traverseTree(value, [...currentPath, key]);
        }
      }
    };

    // Log the start of traversal
    console.log(
      "[DOCS generateStaticParams] Starting to traverse document tree",
    );

    // Traverse the tree to build paths
    traverseTree(docTree);

    // Log the result
    console.log(
      `[DOCS generateStaticParams] Generated ${paths.length} static paths`,
    );

    return paths;
  } catch (error) {
    // During build time, we need to handle errors to prevent build failures
    // This is specifically for the build process and not at runtime
    console.error(
      "[DOCS generateStaticParams] Error generating paths during build:",
      error,
    );

    // Return a minimal set of paths to allow the build to succeed
    // Note: This is only used during build time, not at runtime
    return [
      { slug: ["README"] },
      { slug: ["api"] },
      { slug: ["architecture"] },
      { slug: ["getting-started"] },
    ];
  }
}
