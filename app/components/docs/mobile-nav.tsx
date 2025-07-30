&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import {
  X,
  Search,
  Home,
  FileText,
  Folder,
  ChevronRight,
  ExternalLink,
} from &quot;lucide-react&quot;;
import { cn } from &quot;../../lib/client-utils&quot;;
import type { DocTree } from &quot;../../lib/docs&quot;;

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
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Reset search and active section when nav opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(&quot;&quot;);
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
    const parts = pathname.split(&quot;/&quot;);
    // /docs/section/... => section
    return parts.length > 2 ? parts[2] : null;
  };

  // Convert tree to flattened array for search
  const getFlattenedItems = (tree: DocTree, basePath = &quot;/docs&quot;) => {
    let items: { title: string; path: string; type: &quot;file&quot; | &quot;folder&quot; }[] = [];

    Object.entries(tree).forEach(([key, value]) => {
      if (value === null) {
        // It's a file
        const displayTitle =
          key === &quot;README.md&quot; || key === &quot;README.mdx&quot;
            ? &quot;Overview&quot;
            : key.replace(/\.[^/.]+$/, &quot;&quot;);

        const filePath =
          key === &quot;README.md&quot; || key === &quot;README.mdx&quot;
            ? basePath
            : `${basePath}/${key.replace(/\.[^/.]+$/, &quot;&quot;)}`;

        items.push({
          title: displayTitle,
          path: filePath,
          type: &quot;file&quot;,
        });
      } else {
        // It's a directory
        items.push({
          title: key,
          path: `${basePath}/${key}`,
          type: &quot;folder&quot;,
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
          (k) => k === &quot;README.md&quot; || k === &quot;README.mdx&quot;,
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
          val === null && key !== &quot;README.md&quot; && key !== &quot;README.mdx&quot;,
      )
      .map(([key]) => ({
        title: key.replace(/\.[^/.]+$/, &quot;&quot;),
        path: `/docs/${activeSection}/${key.replace(/\.[^/.]+$/, &quot;&quot;)}`,
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
        &quot;fixed inset-0 bg-white dark:bg-gray-950 z-[90] transition-transform duration-300 ease-in-out overflow-hidden&quot;,
        isOpen ? &quot;translate-y-0&quot; : &quot;translate-y-full&quot;,
      )}
    >
      {/* Header with search & close */}
      <div className=&quot;sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-teal-500 text-white p-4 shadow-md&quot;>
        <div className=&quot;flex items-center justify-between&quot;>
          <Link
            href=&quot;/docs&quot;
            className=&quot;flex items-center space-x-2&quot;
            onClick={onClose}
          >
            <div className=&quot;w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-lg&quot;>
              D
            </div>
            <span className=&quot;font-semibold text-lg&quot;>Documentation</span>
          </Link>
          <button
            onClick={onClose}
            className=&quot;p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors&quot;
            aria-label=&quot;Close navigation&quot;
          >
            <X className=&quot;h-5 w-5&quot; />
          </button>
        </div>

        {/* Search box */}
        <div className=&quot;mt-4 relative&quot;>
          <Search className=&quot;absolute left-3 top-2.5 h-4 w-4 text-white/70&quot; />
          <input
            type=&quot;text&quot;
            placeholder=&quot;Search documentation...&quot;
            className=&quot;w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30&quot;
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Content - conditionally show search results or menu */}
      <div className=&quot;overflow-y-auto h-[calc(100%-135px)] p-4&quot;>
        {searchQuery ? (
          // Search results
          <div>
            <h2 className=&quot;text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2&quot;>
              Search Results
            </h2>

            {filteredItems.length > 0 ? (
              <ul className=&quot;space-y-2&quot;>
                {filteredItems.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.path}
                      className=&quot;flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors&quot;
                      onClick={onClose}
                    >
                      {item.type === &quot;file&quot; ? (
                        <FileText className=&quot;h-4 w-4 text-teal-500&quot; />
                      ) : (
                        <Folder className=&quot;h-4 w-4 text-purple-500&quot; />
                      )}
                      <span className=&quot;font-medium text-gray-700 dark:text-gray-200&quot;>
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className=&quot;text-center py-8&quot;>
                <div className=&quot;inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4&quot;>
                  <Search className=&quot;h-8 w-8 text-gray-400&quot; />
                </div>
                <p className=&quot;text-gray-500 dark:text-gray-400&quot;>
                  No results found
                </p>
              </div>
            )}
          </div>
        ) : (
          // Navigation menu
          <div>
            {/* Quick links */}
            <div className=&quot;mb-6&quot;>
              <h2 className=&quot;text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2&quot;>
                Quick Links
              </h2>
              <div className=&quot;grid grid-cols-2 gap-2&quot;>
                <Link
                  href=&quot;/docs&quot;
                  className=&quot;flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 hover:shadow-md transition-shadow&quot;
                  onClick={onClose}
                >
                  <Home className=&quot;h-5 w-5 text-purple-500 dark:text-purple-400&quot; />
                  <span className=&quot;font-medium text-gray-800 dark:text-gray-200&quot;>
                    Home
                  </span>
                </Link>
                <Link
                  href=&quot;/docs/getting-started&quot;
                  className=&quot;flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 hover:shadow-md transition-shadow&quot;
                  onClick={onClose}
                >
                  <ChevronRight className=&quot;h-5 w-5 text-teal-500 dark:text-teal-400&quot; />
                  <span className=&quot;font-medium text-gray-800 dark:text-gray-200&quot;>
                    Get Started
                  </span>
                </Link>
              </div>
            </div>

            {/* Main sections */}
            <div className=&quot;mb-6&quot;>
              <h2 className=&quot;text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2&quot;>
                Documentation
              </h2>
              <ul className=&quot;space-y-2&quot;>
                {topSections.map((section, i) => (
                  <li key={i}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        &quot;flex items-center justify-between w-full p-3 rounded-lg transition-colors&quot;,
                        section.title === currentSection
                          ? &quot;bg-gradient-to-r from-purple-100 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/20&quot;
                          : &quot;bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800&quot;,
                      )}
                    >
                      <div className=&quot;flex items-center gap-2&quot;>
                        <Folder
                          className={cn(
                            &quot;h-5 w-5&quot;,
                            section.title === currentSection
                              ? &quot;text-purple-600 dark:text-purple-400&quot;
                              : &quot;text-gray-400&quot;,
                          )}
                        />
                        <span className=&quot;font-medium text-gray-800 dark:text-gray-200&quot;>
                          {section.title}
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          &quot;h-4 w-4 text-gray-400 transition-transform&quot;,
                          activeSection === section.title && &quot;rotate-90&quot;,
                        )}
                      />
                    </button>

                    {/* Section files */}
                    {activeSection === section.title && (
                      <ul className=&quot;mt-2 ml-4 space-y-1&quot;>
                        {section.hasReadme && (
                          <li>
                            <Link
                              href={section.path}
                              className={cn(
                                &quot;flex items-center gap-2 p-2 rounded-md&quot;,
                                pathname === section.path
                                  ? &quot;bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300&quot;
                                  : &quot;text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50&quot;,
                              )}
                              onClick={onClose}
                            >
                              <FileText className=&quot;h-4 w-4 text-gray-400&quot; />
                              <span>Overview</span>
                            </Link>
                          </li>
                        )}

                        {activeSectionFiles.map((file, j) => (
                          <li key={j}>
                            <Link
                              href={file.path}
                              className={cn(
                                &quot;flex items-center gap-2 p-2 rounded-md&quot;,
                                pathname === file.path
                                  ? &quot;bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300&quot;
                                  : &quot;text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50&quot;,
                              )}
                              onClick={onClose}
                            >
                              <FileText className=&quot;h-4 w-4 text-gray-400&quot; />
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
      <div className=&quot;fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4&quot;>
        <Link
          href=&quot;https://github.com/yourusername/your-repo&quot;
          className=&quot;flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors&quot;
          target=&quot;_blank&quot;
          rel=&quot;noopener noreferrer&quot;
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className=&quot;h-4 w-4" />
          <span>View on GitHub</span>
        </Link>
      </div>
    </div>
  );
}
