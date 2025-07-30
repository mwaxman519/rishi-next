"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, Home, Search } from "lucide-react";
import { cn } from "../../lib/client-utils";
import { createBreadcrumbsFromPath } from "../../lib/client-utils";
import { TableOfContents } from "./table-of-contents";
import { InDocumentToc } from "./in-document-toc";
import { MobileNav } from "./mobile-nav";
import { MobileTocDrawer } from "./mobile-toc-drawer";
import { ThemeToggle } from "../ui/theme-toggle";
import type { DocTree, DocMetadata } from "../../lib/docs";

interface DocLayoutProps {
  children: React.ReactNode;
  docTree: DocTree;
  currentPath: string;
  metadata: DocMetadata;
}

export function DocLayout({
  children,
  docTree,
  currentPath,
  metadata,
}: DocLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  // Generate breadcrumbs
  const breadcrumbs = createBreadcrumbsFromPath(pathname);

  // Create a unified mobile navigation interface
  const [appNavOpen, setAppNavOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<"docs" | "app">("docs");

  // Mobile TOC drawer state
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen max-w-screen-2xl mx-auto">
      {/* Mobile Navigation System - Enhanced with App and Docs Navigation */}
      <div
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${
          mobileNavOpen || appNavOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setMobileNavOpen(false);
          setAppNavOpen(false);
        }}
      />

      {/* Documentation Mobile Navigation */}
      <div
        className={`
        fixed inset-y-0 left-0 z-[91] w-80 bg-white dark:bg-gray-950 transition-transform duration-300 ease-in-out transform shadow-xl
        ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header with tabs for switching between Doc and App navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-100 to-teal-50 dark:from-purple-900/40 dark:to-teal-900/20">
          <div className="flex-1 flex items-center overflow-hidden">
            <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 relative">
              <Image
                src="/favicon.ico"
                alt="Rishi Logo"
                width={40}
                height={40}
                priority
                className="h-10 w-auto object-contain"
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="ml-2 font-semibold text-lg bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent truncate">
              Documentation
            </span>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-200"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveNav("docs")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeNav === "docs"
                ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => setActiveNav("app")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeNav === "app"
                ? "border-b-2 border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            App Navigation
          </button>
        </div>

        {/* Navigation content - conditionally show docs or app navigation */}
        <div className="overflow-y-auto h-[calc(100vh-116px)]">
          {activeNav === "docs" ? (
            <div className="p-4">
              {/* Search box */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>

              {/* Doc tree navigation */}
              <TableOfContents
                tree={docTree}
                onLinkClick={() => setMobileNavOpen(false)}
              />
            </div>
          ) : (
            <div className="p-4">
              {/* App-wide navigation */}
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Documentation</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/availability"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Availability</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>Users</span>
                  </Link>
                </li>
                {/* You can add more links here */}
              </ul>

              {/* Theme toggle */}
              <div className="mt-6 px-3">
                <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dark Mode
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left Sidebar - Only visible on desktop */}
      <aside className="hidden lg:block w-72 sticky top-0 h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-100 to-teal-50 dark:from-purple-900/40 dark:to-teal-900/40 dark:border-gray-800">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center relative shadow-lg">
              <Image
                src="/favicon.ico"
                alt="Rishi Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-auto object-contain"
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
              Documentation
            </span>
          </Link>
        </div>

        <div className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
          <TableOfContents tree={docTree} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Unified Navigation Header for Mobile - using app-consistent styling */}
        <div className="sticky top-0 z-50 w-full bg-[rgb(var(--background))] border-b border-[rgb(var(--border))] lg:hidden">
          <div className="flex items-center p-3">
            {/* Brand logo */}
            <Link href="/" className="flex items-center mr-4">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src="/favicon.ico"
                  alt="Rishi Logo"
                  width={32}
                  height={32}
                  priority
                  className="object-contain w-auto h-auto"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span className="ml-2 text-lg font-bold text-[rgb(var(--primary))] hidden sm:inline-block">
                Rishi
              </span>
            </Link>

            {/* Navigation buttons */}
            <div className="flex gap-2 flex-grow justify-end">
              {/* Docs button - Document folders navigation */}
              <button
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.15)] transition-colors"
                onClick={() => {
                  setMobileNavOpen(true);
                  setActiveNav("docs");
                }}
                aria-label="Open documentation menu"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Docs</span>
              </button>

              {/* Tree button - In-document table of contents */}
              <button
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-[rgba(var(--secondary),0.1)] text-[rgb(var(--secondary))] hover:bg-[rgba(var(--secondary),0.15)] transition-colors"
                onClick={() => setMobileDocsOpen(true)}
                aria-label="Open document tree"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-sm font-medium">Tree</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex">
          {/* Document content */}
          <div className="flex-1 min-w-0 p-4 pt-16 md:p-8 md:pt-16 lg:p-10 lg:pt-10">
            <div className="max-w-4xl mx-auto">
              <article className="prose prose-gray max-w-none dark:prose-invert prose-headings:bg-gradient-to-r prose-headings:from-purple-700 prose-headings:to-teal-600 prose-headings:bg-clip-text prose-headings:text-transparent dark:prose-headings:from-purple-400 dark:prose-headings:to-teal-300 prose-a:text-purple-600 dark:prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-code:bg-purple-50 prose-code:text-purple-800 dark:prose-code:bg-purple-900/30 dark:prose-code:text-teal-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-[''] prose-code:after:content-['']">
                {children}
              </article>

              {/* Footer */}
              <footer className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[rgba(var(--primary),0.15)] flex items-center justify-center mr-2">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                          stroke="rgb(var(--primary))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12V3M12 3L9 6M12 3L15 6"
                          stroke="rgb(var(--primary))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p>
                      Last updated:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {metadata.lastUpdated?.toLocaleDateString() ||
                          "Unknown"}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-6">
                    <Link
                      href="#"
                      className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit this page
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Report an issue
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-950/30 dark:to-teal-950/30 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between border border-purple-100/50 dark:border-purple-800/20">
                  <div>
                    <h3 className="text-base font-medium bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300 mb-1">
                      Did this documentation help you?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We're always looking to improve our documentation.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <button className="px-4 py-2 rounded-md border border-purple-200 dark:border-purple-700 hover:bg-white dark:hover:bg-purple-900/20 transition-all shadow-sm hover:shadow bg-white/50 dark:bg-transparent">
                      <span>👍 Yes</span>
                    </button>
                    <button className="px-4 py-2 rounded-md border border-teal-200 dark:border-teal-700 hover:bg-white dark:hover:bg-teal-900/20 transition-all shadow-sm hover:shadow bg-white/50 dark:bg-transparent">
                      <span>👎 No</span>
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </div>

          {/* Right sidebar - In-document navigation (floating) */}
          <div className="lg:block">
            <div className="sticky top-[160px] right-8 w-64 z-10 float-right mr-8">
              <div className="rounded-lg bg-gradient-to-br from-white/80 to-purple-50/80 p-4 shadow-lg border border-purple-100 backdrop-blur-sm dark:from-gray-900/80 dark:to-purple-950/30 dark:border-purple-900/30 max-h-[calc(100vh-200px)] overflow-y-auto transition-all hover:shadow-xl">
                <InDocumentToc />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {/* Home link */}
          <Link
            href="/"
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>

          {/* Docs link - active */}
          <Link
            href="/docs"
            className="flex flex-col items-center p-2 text-purple-600 dark:text-purple-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-xs mt-1">Docs</span>
          </Link>

          {/* In-page TOC toggle - Mobile only */}
          <button
            onClick={() => setTocDrawerOpen(true)}
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <span className="text-xs mt-1">Contents</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => {
              // Toggle theme
              document.documentElement.classList.toggle("dark");
            }}
            className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400"
          >
            <svg
              className="h-6 w-6 dark:hidden"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <svg
              className="h-6 w-6 hidden dark:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="text-xs mt-1">Theme</span>
          </button>
        </div>
      </div>

      {/* Mobile TOC Drawer */}
      <MobileTocDrawer
        isOpen={tocDrawerOpen}
        onClose={() => setTocDrawerOpen(false)}
      />

      {/* Mobile Docs Tree Overlay */}
      {mobileDocsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300"
          onClick={() => setMobileDocsOpen(false)}
        />
      )}

      {/* Mobile Docs Tree Panel */}
      <div
        className={`
        fixed inset-y-0 right-0 z-[91] w-80 bg-white dark:bg-gray-950 transition-transform duration-300 ease-in-out transform shadow-xl overflow-hidden
        ${mobileDocsOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20">
          <h3 className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Document Tree
          </h3>
          <button
            onClick={() => setMobileDocsOpen(false)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-200"
            aria-label="Close document tree"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Document Tree Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] p-4">
          <TableOfContents
            tree={docTree}
            onLinkClick={() => setMobileDocsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
