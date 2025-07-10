"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Search,
  Home,
  FileText,
  Folder,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../lib/client-utils";
import type { DocTree } from "../../lib/docs";

interface MobileNavProps {
  tree: DocTree;
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export function MobileNav({
  tree,
  isOpen,
  onClose,
  currentPath,
}: MobileNavProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Reset search and active section when nav opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveSection(null);
    }
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle section toggle
  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  // Extract the current section (if any) from the pathname
  const getCurrentSection = () => {
    const parts = pathname.split("/");
    // /docs/section/... => section
    return parts.length > 2 ? parts[2] : null;
  };

  // Convert tree to flattened array for search
  const getFlattenedItems = (tree: DocTree, basePath = "/docs") => {
    let items: { title: string; path: string; type: "file" | "folder" }[] = [];

    Object.entries(tree).forEach(([key, value]) => {
      if (value === null) {
        // It's a file
        const displayTitle =
          key === "README.md" || key === "README.mdx"
            ? "Overview"
            : key.replace(/\.[^/.]+$/, "");

        const filePath =
          key === "README.md" || key === "README.mdx"
            ? basePath
            : `${basePath}/${key.replace(/\.[^/.]+$/, "")}`;

        items.push({
          title: displayTitle,
          path: filePath,
          type: "file",
        });
      } else {
        // It's a directory
        items.push({
          title: key,
          path: `${basePath}/${key}`,
          type: "folder",
        });

        // Recursively add items from subdirectory
        items = [...items, ...getFlattenedItems(value, `${basePath}/${key}`)];
      }
    });

    return items;
  };

  // Get top-level sections
  const getTopSections = () => {
    return Object.entries(tree)
      .filter(([key, value]) => value !== null) // Only directories
      .map(([key, value]) => ({
        title: key,
        hasReadme: Object.keys(value as DocTree).some(
          (k) => k === "README.md" || k === "README.mdx",
        ),
        path: `/docs/${key}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  };

  // Get files for the active section
  const getActiveSectionFiles = () => {
    if (!activeSection) return [];

    const sectionTree = Object.entries(tree).find(
      ([key]) => key === activeSection,
    );
    if (!sectionTree) return [];

    const [, value] = sectionTree;

    return Object.entries(value as DocTree)
      .filter(
        ([key, val]) =>
          val === null && key !== "README.md" && key !== "README.mdx",
      )
      .map(([key]) => ({
        title: key.replace(/\.[^/.]+$/, ""),
        path: `/docs/${activeSection}/${key.replace(/\.[^/.]+$/, "")}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  };

  // Filter items based on search query
  const filteredItems = searchQuery
    ? getFlattenedItems(tree).filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const topSections = getTopSections();
  const activeSectionFiles = getActiveSectionFiles();
  const currentSection = getCurrentSection();

  return (
    <div
      className={cn(
        "fixed inset-0 bg-white dark:bg-gray-950 z-[90] transition-transform duration-300 ease-in-out overflow-hidden",
        isOpen ? "translate-y-0" : "translate-y-full",
      )}
    >
      {/* Header with search & close */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-teal-500 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <Link
            href="/docs"
            className="flex items-center space-x-2"
            onClick={onClose}
          >
            <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-lg">
              D
            </div>
            <span className="font-semibold text-lg">Documentation</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search box */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Content - conditionally show search results or menu */}
      <div className="overflow-y-auto h-[calc(100%-135px)] p-4">
        {searchQuery ? (
          // Search results
          <div>
            <h2 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Search Results
            </h2>

            {filteredItems.length > 0 ? (
              <ul className="space-y-2">
                {filteredItems.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.path}
                      className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      onClick={onClose}
                    >
                      {item.type === "file" ? (
                        <FileText className="h-4 w-4 text-teal-500" />
                      ) : (
                        <Folder className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No results found
                </p>
              </div>
            )}
          </div>
        ) : (
          // Navigation menu
          <div>
            {/* Quick links */}
            <div className="mb-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Quick Links
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/docs"
                  className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 hover:shadow-md transition-shadow"
                  onClick={onClose}
                >
                  <Home className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Home
                  </span>
                </Link>
                <Link
                  href="/docs/getting-started"
                  className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 hover:shadow-md transition-shadow"
                  onClick={onClose}
                >
                  <ChevronRight className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Get Started
                  </span>
                </Link>
              </div>
            </div>

            {/* Main sections */}
            <div className="mb-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Documentation
              </h2>
              <ul className="space-y-2">
                {topSections.map((section, i) => (
                  <li key={i}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        "flex items-center justify-between w-full p-3 rounded-lg transition-colors",
                        section.title === currentSection
                          ? "bg-gradient-to-r from-purple-100 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/20"
                          : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Folder
                          className={cn(
                            "h-5 w-5",
                            section.title === currentSection
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gray-400",
                          )}
                        />
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {section.title}
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-gray-400 transition-transform",
                          activeSection === section.title && "rotate-90",
                        )}
                      />
                    </button>

                    {/* Section files */}
                    {activeSection === section.title && (
                      <ul className="mt-2 ml-4 space-y-1">
                        {section.hasReadme && (
                          <li>
                            <Link
                              href={section.path}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md",
                                pathname === section.path
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                              )}
                              onClick={onClose}
                            >
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>Overview</span>
                            </Link>
                          </li>
                        )}

                        {activeSectionFiles.map((file, j) => (
                          <li key={j}>
                            <Link
                              href={file.path}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md",
                                pathname === file.path
                                  ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                              )}
                              onClick={onClose}
                            >
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>{file.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <Link
          href="https://github.com/yourusername/your-repo"
          className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
          <span>View on GitHub</span>
        </Link>
      </div>
    </div>
  );
}
