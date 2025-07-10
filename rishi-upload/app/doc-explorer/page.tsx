"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DocExplorerPage() {
  const [currentPath, setCurrentPath] = useState("");
  const [docData, setDocData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load root directory on initial load
  useEffect(() => {
    fetchDocPath("");
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

      console.log("Doc data:", data);
      setDocData(data);
      setCurrentPath(path);
    } catch (err) {
      console.error("Error fetching doc path:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch documentation",
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

    const parts = currentPath.split("/");
    parts.pop();
    const parentPath = parts.join("/");

    fetchDocPath(parentPath);
  }

  // Render content based on data type
  function renderContent() {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!docData) {
      return (
        <div className="text-gray-500">
          No documentation loaded. Try refreshing the page.
        </div>
      );
    }

    if (!docData.exists) {
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
          <p className="font-medium">Not Found</p>
          <p className="text-sm">
            The requested documentation path was not found.
          </p>
          <p className="text-sm mt-2">
            <button
              onClick={() => fetchDocPath("")}
              className="text-blue-600 hover:underline"
            >
              Return to root
            </button>
          </p>
        </div>
      );
    }

    if (docData.type === "directory") {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm mb-4">
            <button
              onClick={() => fetchDocPath("")}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Root
            </button>

            {currentPath && (
              <button
                onClick={navigateUp}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                ↑ Up
              </button>
            )}

            <span className="text-gray-400">/</span>

            {currentPath
              .split("/")
              .filter(Boolean)
              .map((segment, index, segments) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() =>
                      fetchDocPath(segments.slice(0, index + 1).join("/"))
                    }
                    className="hover:underline"
                  >
                    {segment}
                  </button>
                  {index < segments.length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </React.Fragment>
              ))}
          </div>

          <h2 className="text-lg font-medium mb-2">
            {currentPath ? `Directory: ${currentPath}` : "Root Directory"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {docData.files &&
              docData.files.map((file: string, index: number) => {
                const isDirectory = !file.includes(".");

                return (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() =>
                        isDirectory
                          ? navigateToDirectory(file)
                          : fetchDocPath(`${currentPath}/${file}`)
                      }
                      className={`flex items-center px-3 py-2 rounded-md w-full text-left hover:bg-gray-100
                      ${isDirectory ? "text-blue-700" : "text-gray-700"}`}
                    >
                      <span className="mr-2">{isDirectory ? "📁" : "📄"}</span>
                      {file}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      );
    }

    if (docData.type === "file") {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm mb-4">
            <button
              onClick={() => fetchDocPath("")}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Root
            </button>

            <button
              onClick={navigateUp}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              ↑ Up
            </button>

            <span className="text-gray-400">/</span>

            {currentPath
              .split("/")
              .filter(Boolean)
              .map((segment, index, segments) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() =>
                      fetchDocPath(segments.slice(0, index + 1).join("/"))
                    }
                    className="hover:underline"
                  >
                    {segment}
                  </button>
                  {index < segments.length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </React.Fragment>
              ))}
          </div>

          <h2 className="text-lg font-medium mb-4">
            File: {currentPath.split("/").pop()}
          </h2>

          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-sm text-gray-700 font-mono">
              {currentPath}
            </div>
            <pre className="p-4 overflow-auto text-sm bg-white text-gray-800 max-h-[70vh]">
              {docData.content}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="text-gray-500">
        Unknown content type. Please refresh and try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentation Explorer</h1>
        <p className="text-gray-600">
          Browse and view documentation files directly from the filesystem.
        </p>
      </header>

      <main className="bg-white rounded-lg shadow p-6">{renderContent()}</main>
    </div>
  );
}
