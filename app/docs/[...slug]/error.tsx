"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, BookOpen, Search, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DocsError({ error, reset }: ErrorPageProps) {
  const errorMessage = error.message || "An unexpected error occurred";
  const is404 = errorMessage.includes("404") || errorMessage.includes("not found");
  const is500 = errorMessage.includes("500") || errorMessage.includes("Internal");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Error Icon */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {is404 ? "Documentation Not Found" : "Documentation Error"}
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {is404 
              ? "The documentation page you're looking for doesn't exist or has been moved." 
              : "There was an error loading the documentation. Please try again."}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            What happened?
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-mono text-sm">
              {errorMessage}
            </p>
          </div>
          
          {is404 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Common reasons for this error:
              </h3>
              <ul className="text-slate-700 dark:text-slate-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  The documentation file may have been moved or renamed
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  The URL might contain a typo or incorrect path
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  The documentation might be in a different category
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Helpful Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/docs"
            className="flex items-center p-6 rounded-xl bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 hover:shadow-lg group"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Browse Documentation
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Return to documentation home page
              </p>
            </div>
          </Link>

          <Link
            href="/docs/README"
            className="flex items-center p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg group"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Getting Started
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Start with the main documentation
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Popular Documentation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/docs/api/README"
              className="flex items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-slate-900 dark:text-white">API Reference</span>
            </Link>
            <Link
              href="/docs/architecture/README"
              className="flex items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3" />
              <span className="text-slate-900 dark:text-white">Architecture</span>
            </Link>
            <Link
              href="/docs/deployment/README"
              className="flex items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-slate-900 dark:text-white">Deployment</span>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}