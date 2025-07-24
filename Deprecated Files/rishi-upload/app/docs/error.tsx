"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Info,
  RefreshCw,
  FolderTree,
  FileSearch,
} from "lucide-react";

interface ErrorComponentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DocsErrorComponent({
  error,
  reset,
}: ErrorComponentProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [initializationSuccess, setInitializationSuccess] = useState(false);

  // Format the error message for display
  const errorMessage = error?.message || "An unknown error occurred";
  const errorStack = error?.stack || "";
  const errorDigest = error?.digest || "";

  // Function to show a toast message (simplified since we don't have the toast hook)
  const showToast = (message: string, type: "success" | "error") => {
    // Create a simple toast element that auto-removes itself
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`;
    toast.innerText = message;
    document.body.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
  };

  // Function to reinitialize documentation and reset the error boundary
  const reinitializeDocumentation = async () => {
    setIsInitializing(true);

    try {
      // Explicitly call the initialization API with force=true
      const response = await fetch("/api/docs/init?force=true&emergency=true", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (response.ok) {
        const data = await response.json();
        showToast(
          `Documentation reinitialized: ${data.message || "Success"}`,
          "success",
        );
        setInitializationSuccess(true);

        // Give the system a moment to complete initialization
        setTimeout(() => {
          reset(); // Reset the error boundary
        }, 1500);
      } else {
        const errorText = await response.text();
        showToast(
          `Failed to reinitialize: ${response.status} ${response.statusText}`,
          "error",
        );
      }
    } catch (err) {
      showToast(
        `Error during reinitialization: ${err instanceof Error ? err.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  // Function to view diagnostic information
  const viewDiagnostics = () => {
    window.location.href = "/docs-debug";
  };

  // Function to force emergency documentation generation
  const forceEmergencyDocs = async () => {
    try {
      // Run the script via API endpoint
      const response = await fetch("/api/docs/emergency-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force: true }),
      });

      if (response.ok) {
        showToast(
          "Emergency documentation setup initiated. Reinitializing...",
          "success",
        );
        // Then reinitialize
        await reinitializeDocumentation();
      } else {
        showToast("Failed to run emergency setup", "error");
      }
    } catch (err) {
      showToast(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        "error",
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-3xl bg-gray-50 dark:bg-gray-900 border border-red-200 dark:border-red-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center text-red-700 dark:text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <h2 className="text-xl font-semibold">Documentation System Error</h2>
        </div>

        <div className="mb-4">
          <p className="mb-2">
            An error occurred while loading the documentation system:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 mb-4 font-mono text-sm overflow-auto max-h-24">
            {errorMessage}
          </div>

          {initializationSuccess && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 p-3 rounded-md mt-2">
              <p className="text-green-700 dark:text-green-400">
                Reinitialization successful! The page should refresh
                momentarily...
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={reinitializeDocumentation}
            disabled={isInitializing}
            className={`flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors
              ${
                isInitializing
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {isInitializing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Reinitializing Documentation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Reinitializing Documentation
              </>
            )}
          </button>

          <button
            onClick={viewDiagnostics}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium
              bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            <Info className="w-4 h-4 mr-2" />
            View Detailed Documentation Diagnostics
          </button>

          <button
            onClick={forceEmergencyDocs}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium
              bg-amber-600 hover:bg-amber-700 text-white"
          >
            <FolderTree className="w-4 h-4 mr-2" />
            Emergency: Force Generate Documentation
          </button>

          <button
            onClick={() => setDetailsVisible(!detailsVisible)}
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium
              bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {detailsVisible
              ? "Hide Technical Details"
              : "Show Technical Details"}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 rounded-md font-medium
              bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
          >
            Return to Home Page
          </Link>

          {detailsVisible && (
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-auto max-h-64">
              <h3 className="text-sm font-semibold mb-2">Error Stack:</h3>
              <pre className="text-xs whitespace-pre-wrap">{errorStack}</pre>

              {errorDigest && (
                <>
                  <h3 className="text-sm font-semibold mt-3 mb-2">
                    Error Digest:
                  </h3>
                  <code className="text-xs">{errorDigest}</code>
                </>
              )}

              <h3 className="text-sm font-semibold mt-3 mb-2">
                Runtime Information:
              </h3>
              <div className="text-xs">
                <p>Next.js Environment: {process.env.NODE_ENV}</p>
                <p>Document Path: {window.location.pathname}</p>
                <p>Browser: {navigator.userAgent}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
