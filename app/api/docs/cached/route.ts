import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getDocumentByPath, getDocTree } from &quot;@/lib/docs&quot;;

// Cache duration in seconds
const CACHE_MAX_AGE = 86400; // 24 hours
const STALE_WHILE_REVALIDATE = 604800; // 7 days

/**
 * GET handler for cached documentation API
 * This route provides cached documentation content with proper HTTP caching headers
 */
export async function GET(request: NextRequest) {
  try {
    // Extract the document path from the URL
    const searchParams = new URL(request.url).searchParams;
    const docPath = (searchParams.get(&quot;path&quot;) || undefined) || "&quot;;

    console.log(`[DOCS CACHE API] Requesting cached document: ${docPath}`);

    if (!docPath) {
      // If no path specified, return the documentation tree with caching
      const tree = await getDocTree();

      return NextResponse.json(
        { tree },
        {
          headers: {
            &quot;Cache-Control&quot;: `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
            &quot;Content-Type&quot;: &quot;application/json&quot;,
          },
        },
      );
    }

    // Fetch the document content
    const doc = await getDocumentByPath(docPath);

    if (!doc) {
      console.log(`[DOCS CACHE API] Document not found: ${docPath}`);
      return NextResponse.json(
        { error: &quot;Document not found&quot; },
        { status: 404 },
      );
    }

    // Serialize the content for JSON response
    const response = {
      title: doc.metadata.title,
      description: doc.metadata.description || &quot;&quot;,
      tags: doc.metadata.tags || [],
      lastUpdated: doc.lastModified
        ? doc.lastModified.toISOString()
        : null,
      // We can&apos;t include the actual content as it&apos;s a React node
      // But we include the metadata to help with prefetching
    };

    // Create response with cache control headers
    return NextResponse.json(response, {
      headers: {
        &quot;Cache-Control&quot;: `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        &quot;Content-Type&quot;: &quot;application/json&quot;,
      },
    });
  } catch (error) {
    console.error(&quot;[DOCS CACHE API] Error serving cached document:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch document" },
      { status: 500 },
    );
  }
}
