&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import Link from &quot;next/link&quot;;

export default function DocExplorerPage() {
  const [currentPath, setCurrentPath] = useState("&quot;);
  const [docData, setDocData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load root directory on initial load
  useEffect(() => {
    fetchDocPath(&quot;&quot;);
  }, []);

  // Fetch documentation at the specified path
  async function fetchDocPath(path: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/doc-path?path=${encodeURIComponent(path)}`,
      );
      const data = await response.json();

      console.log(&quot;Doc data:&quot;, data);
      setDocData(data);
      setCurrentPath(path);
    } catch (err) {
      console.error(&quot;Error fetching doc path:&quot;, err);
      setError(
        err instanceof Error ? err.message : &quot;Failed to fetch documentation&quot;,
      );
    } finally {
      setLoading(false);
    }
  }

  // Navigate to a directory
  function navigateToDirectory(dirName: string) {
    const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
    fetchDocPath(newPath);
  }

  // Navigate to parent directory
  function navigateUp() {
    if (!currentPath) return;

    const parts = currentPath.split(&quot;/&quot;);
    parts.pop();
    const parentPath = parts.join(&quot;/&quot;);

    fetchDocPath(parentPath);
  }

  // Render content based on data type
  function renderContent() {
    if (loading) {
      return (
        <div className=&quot;animate-pulse space-y-4&quot;>
          <div className=&quot;h-4 bg-gray-200 rounded w-3/4&quot;></div>
          <div className=&quot;h-4 bg-gray-200 rounded w-1/2&quot;></div>
          <div className=&quot;h-4 bg-gray-200 rounded w-5/6&quot;></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className=&quot;p-4 bg-red-50 border border-red-200 rounded-md text-red-600&quot;>
          <p className=&quot;font-medium&quot;>Error</p>
          <p className=&quot;text-sm&quot;>{error}</p>
        </div>
      );
    }

    if (!docData) {
      return (
        <div className=&quot;text-gray-500&quot;>
          No documentation loaded. Try refreshing the page.
        </div>
      );
    }

    if (!docData.exists) {
      return (
        <div className=&quot;p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700&quot;>
          <p className=&quot;font-medium&quot;>Not Found</p>
          <p className=&quot;text-sm&quot;>
            The requested documentation path was not found.
          </p>
          <p className=&quot;text-sm mt-2&quot;>
            <button
              onClick={() => fetchDocPath(&quot;&quot;)}
              className=&quot;text-blue-600 hover:underline&quot;
            >
              Return to root
            </button>
          </p>
        </div>
      );
    }

    if (docData.type === &quot;directory&quot;) {
      return (
        <div className=&quot;space-y-4&quot;>
          <div className=&quot;flex items-center space-x-2 text-sm mb-4&quot;>
            <button
              onClick={() => fetchDocPath(&quot;&quot;)}
              className=&quot;px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded&quot;
            >
              Root
            </button>

            {currentPath && (
              <button
                onClick={navigateUp}
                className=&quot;px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded&quot;
              >
                ↑ Up
              </button>
            )}

            <span className=&quot;text-gray-400&quot;>/</span>

            {currentPath
              .split(&quot;/&quot;)
              .filter(Boolean)
              .map((segment, index, segments) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() =>
                      fetchDocPath(segments.slice(0, index + 1).join(&quot;/&quot;))
                    }
                    className=&quot;hover:underline&quot;
                  >
                    {segment}
                  </button>
                  {index < segments.length - 1 && (
                    <span className=&quot;text-gray-400&quot;>/</span>
                  )}
                </React.Fragment>
              ))}
          </div>

          <h2 className=&quot;text-lg font-medium mb-2&quot;>
            {currentPath ? `Directory: ${currentPath}` : &quot;Root Directory&quot;}
          </h2>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-2&quot;>
            {docData.files &&
              docData.files.map((file: string, index: number) => {
                const isDirectory = !file.includes(&quot;.&quot;);

                return (
                  <div key={index} className=&quot;flex items-center&quot;>
                    <button
                      onClick={() =>
                        isDirectory
                          ? navigateToDirectory(file)
                          : fetchDocPath(`${currentPath}/${file}`)
                      }
                      className={`flex items-center px-3 py-2 rounded-md w-full text-left hover:bg-gray-100
                      ${isDirectory ? &quot;text-blue-700&quot; : &quot;text-gray-700&quot;}`}
                    >
                      <span className=&quot;mr-2&quot;>{isDirectory ? &quot;📁&quot; : &quot;📄&quot;}</span>
                      {file}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      );
    }

    if (docData.type === &quot;file&quot;) {
      return (
        <div className=&quot;space-y-4&quot;>
          <div className=&quot;flex items-center space-x-2 text-sm mb-4&quot;>
            <button
              onClick={() => fetchDocPath(&quot;&quot;)}
              className=&quot;px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded&quot;
            >
              Root
            </button>

            <button
              onClick={navigateUp}
              className=&quot;px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded&quot;
            >
              ↑ Up
            </button>

            <span className=&quot;text-gray-400&quot;>/</span>

            {currentPath
              .split(&quot;/&quot;)
              .filter(Boolean)
              .map((segment, index, segments) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() =>
                      fetchDocPath(segments.slice(0, index + 1).join(&quot;/&quot;))
                    }
                    className=&quot;hover:underline&quot;
                  >
                    {segment}
                  </button>
                  {index < segments.length - 1 && (
                    <span className=&quot;text-gray-400&quot;>/</span>
                  )}
                </React.Fragment>
              ))}
          </div>

          <h2 className=&quot;text-lg font-medium mb-4&quot;>
            File: {currentPath.split(&quot;/&quot;).pop()}
          </h2>

          <div className=&quot;border border-gray-200 rounded-md overflow-hidden&quot;>
            <div className=&quot;bg-gray-100 border-b border-gray-200 px-4 py-2 text-sm text-gray-700 font-mono&quot;>
              {currentPath}
            </div>
            <pre className=&quot;p-4 overflow-auto text-sm bg-white text-gray-800 max-h-[70vh]&quot;>
              {docData.content}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className=&quot;text-gray-500&quot;>
        Unknown content type. Please refresh and try again.
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto px-4 py-8 max-w-6xl&quot;>
      <header className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold mb-2&quot;>Documentation Explorer</h1>
        <p className=&quot;text-gray-600&quot;>
          Browse and view documentation files directly from the filesystem.
        </p>
      </header>

      <main className=&quot;bg-white rounded-lg shadow p-6">{renderContent()}</main>
    </div>
  );
}
