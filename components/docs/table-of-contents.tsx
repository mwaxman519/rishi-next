"use client";

import React, {
  useState,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
} from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import { cn } from "@/components/../lib/client-utils";
import type { DocTree } from "@/components/../lib/docs";

// Custom Link component to handle onClick type issues
const Link = ({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className: string;
  onClick?: MouseEventHandler<HTMLAnchorElement> | (() => void);
  children: ReactNode;
}) => {
  // Use regular anchor tag instead of NextLink to ensure it works in all environments
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        // Execute the onClick handler if it exists
        if (onClick) {
          onClick(e as unknown as MouseEvent<HTMLAnchorElement>);
        }
      }}
    >
      {children}
    </a>
  );
};

interface TableOfContentsProps {
  tree: DocTree;
  className?: string;
  onLinkClick?: () => void;
}

export function TableOfContents({
  tree,
  className,
  onLinkClick,
}: TableOfContentsProps) {
  // Create a handler that will be passed down to all links
  const handleLinkClick = onLinkClick ? () => onLinkClick() : undefined;

  // For debugging - only shown in development
  if (process.env.NODE_ENV !== "production") {
    if (tree) {
      console.log("TableOfContents: Tree root keys:", Object.keys(tree));
    } else {
      console.warn("TableOfContents: No tree object provided");
    }
  }

  // Get the current pathname to determine the active link
  const pathname = usePathname();
  // Always use /docs as the base path for document tree links
  const basePath = "/docs";

  return (
    <nav className={cn("text-sm", className)}>
      <TreeNode
        tree={tree}
        level={0}
        basePath={basePath}
        onLinkClick={handleLinkClick}
      />
    </nav>
  );
}

interface TreeNodeProps {
  tree: DocTree;
  level: number;
  basePath: string;
  onLinkClick: (() => void) | undefined;
}

function TreeNode({ tree, level, basePath, onLinkClick }: TreeNodeProps) {
  const pathname = usePathname();

  // Debug the contents of the tree at this level (development only)
  if (process.env.NODE_ENV !== "production") {
    console.log(`TreeNode at ${basePath} has entries:`, Object.keys(tree));
  }

  // Ensure we have a valid tree object
  if (!tree || typeof tree !== "object") {
    if (process.env.NODE_ENV !== "production") {
      console.error(`Invalid tree at ${basePath}: `, tree);
    }
    return null;
  }

  // Find README files first to ensure they're displayed at the top of their directory
  let entries = Object.entries(tree);
  let readmeEntry = entries.find(
    ([key]) => key === "README.md" || key === "README.mdx" || key === "README",
  );

  // Collect directories and files separately
  // For directories, check if they have a README to avoid showing both "api" and then "api/Overview"
  const directories = entries
    .filter(
      ([key, value]) =>
        value !== null &&
        key !== "README.md" &&
        key !== "README.mdx" &&
        key !== "README",
    )
    .sort((a, b) => a[0].localeCompare(b[0])); // Sort directories alphabetically

  const files = entries
    .filter(
      ([key, value]) =>
        value === null &&
        key !== "README.md" &&
        key !== "README.mdx" &&
        key !== "README",
    )
    .sort((a, b) => a[0].localeCompare(b[0])); // Sort files alphabetically

  // Debug the collected directories and files (development only)
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `TreeNode at ${basePath}: Found ${directories.length} directories and ${files.length} files`,
    );
  }

  // If we have no content, try to reinitialize (client-side only)
  if (
    directories.length === 0 &&
    files.length === 0 &&
    typeof window !== "undefined"
  ) {
    console.warn(
      `[DOCS TOC] Empty tree at ${basePath}, attempting to reinitialize...`,
    );
    // Try to initialize docs in the background - fetch directly (don't await)
    fetch("/api/docs/init")
      .then((response) => {
        if (response.ok) {
          console.log(
            "[DOCS TOC] Reinitialization succeeded, refreshing page...",
          );
          // Reload the page after a short delay if we successfully initialized
          setTimeout(() => window.location.reload(), 1000);
        } else {
          console.error("[DOCS TOC] Reinitialization failed");
        }
      })
      .catch((err) => {
        console.error("[DOCS TOC] Reinitialization error:", err);
      });
  }

  // Create a properly typed click handler for Link components
  const handleClick: MouseEventHandler<HTMLAnchorElement> | undefined =
    onLinkClick
      ? (e) => {
          onLinkClick();
        }
      : undefined;

  return (
    <ul className={cn("space-y-0.5", level > 0 && "ml-3 mt-0.5")}>
      {/* Display README first as "Overview" for the current directory */}
      {/* Only display "Overview" if we're at the root level (not inside a directory) */}
      {readmeEntry && (level === 0 || basePath === "/docs") && (
        <li key={readmeEntry[0]}>
          {handleClick ? (
            <Link
              href={`${basePath}`} // Link directly to directory path, which shows README
              className={cn(
                "flex items-center gap-2 py-1 px-2 rounded-md text-sm",
                "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50",
                pathname === basePath &&
                  "bg-gradient-to-r from-purple-100 to-teal-50 text-purple-700 dark:from-purple-900/20 dark:to-teal-900/10 dark:text-purple-300",
              )}
              onClick={handleClick}
            >
              <File className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">Overview</span>
            </Link>
          ) : (
            <Link
              href={`${basePath}`} // Link directly to directory path, which shows README
              className={cn(
                "flex items-center gap-2 py-1 px-2 rounded-md text-sm",
                "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50",
                pathname === basePath &&
                  "bg-gradient-to-r from-purple-100 to-teal-50 text-purple-700 dark:from-purple-900/20 dark:to-teal-900/10 dark:text-purple-300",
              )}
            >
              <File className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">Overview</span>
            </Link>
          )}
        </li>
      )}

      {/* Display directories first - alphabetically sorted */}
      {directories.map(([key, value]) => {
        const currentPath = `${basePath}/${key}`;
        const isActive = pathname.startsWith(currentPath);

        return (
          <DirectoryNode
            key={key}
            name={key}
            value={value as DocTree}
            level={level + 1}
            basePath={basePath}
            currentPath={currentPath}
            isActive={isActive}
            onLinkClick={onLinkClick}
          />
        );
      })}

      {/* Then display regular files - alphabetically sorted */}
      {files.map(([key]) => {
        const displayText = key.replace(/\.[^/.]+$/, ""); // Remove file extension
        const pathKey = key.replace(/\.[^/.]+$/, ""); // Remove file extension for path

        // Always use the base path and the clean key without any extension
        // This ensures we don't append .md to the URLs
        const currentPath = `${basePath}/${pathKey}`.replace(/\.md$/, "");
        const isActive = pathname === currentPath;

        // Log the file path we're creating (development only)
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `[TOC] Creating file link: ${key} at path: ${currentPath}`,
          );
        }

        return (
          <li key={key}>
            {handleClick ? (
              <Link
                href={currentPath}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 rounded-md text-sm",
                  "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50",
                  isActive &&
                    "bg-gradient-to-r from-teal-100 to-purple-50 text-teal-700 dark:from-teal-900/20 dark:to-purple-900/10 dark:text-teal-300",
                )}
                onClick={handleClick}
              >
                <File className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="truncate">{displayText}</span>
              </Link>
            ) : (
              <Link
                href={currentPath}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 rounded-md text-sm",
                  "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50",
                  isActive &&
                    "bg-gradient-to-r from-teal-100 to-purple-50 text-teal-700 dark:from-teal-900/20 dark:to-purple-900/10 dark:text-teal-300",
                )}
              >
                <File className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="truncate">{displayText}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface DirectoryNodeProps {
  name: string;
  value: DocTree;
  level: number;
  basePath: string;
  currentPath: string;
  isActive: boolean;
  onLinkClick: (() => void) | undefined;
}

function DirectoryNode({
  name,
  value,
  level,
  basePath,
  currentPath,
  isActive,
  onLinkClick,
}: DirectoryNodeProps) {
  // For 'endpoints' directory that has files within the api directory, always keep it open
  // This specifically helps with the /api/endpoints directory showing all its files
  const isEndpointsDir = name === "endpoints" && basePath.includes("/api");
  const [isOpen, setIsOpen] = useState(isActive || isEndpointsDir);
  const pathname = usePathname();

  // Debug the contents of this directory (development only)
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `Directory ${name} at path ${basePath} has files:`,
      Object.keys(value),
    );
  }

  // Ensure directory value is valid
  if (!value || typeof value !== "object") {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `Invalid directory value for ${name} at ${basePath}:`,
        value,
      );
    }
    return null;
  }

  // Check if this directory has a README.md or README.mdx file
  const hasReadme = Object.keys(value).some(
    (key) => key === "README.md" || key === "README.mdx" || key === "README",
  );

  // Clean the path to ensure it doesn't have double slashes
  // This is a safeguard against paths like /docs//directory
  const cleanCurrentPath = currentPath.replace(/\/+/g, "/");

  // Log the path info (development only)
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `DirectoryNode ${name}: Current path = ${cleanCurrentPath}, pathname = ${pathname}`,
    );
  }

  // If directory has README, make the folder name itself clickable directly to the README content
  const handleClick = () => {
    if (!hasReadme) {
      setIsOpen(!isOpen);
    }
  };

  // Create a properly typed click handler for Link components
  const handleLinkClick: MouseEventHandler<HTMLAnchorElement> | undefined =
    onLinkClick
      ? (e) => {
          onLinkClick();
        }
      : undefined;

  // Log the directory name before rendering (development only)
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[TOC] Rendering directory node: ${name}, path: ${cleanCurrentPath}`,
    );
  }

  return (
    <li>
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 mr-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800/50"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-150 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-150 text-gray-400" />
          )}
        </button>

        {hasReadme ? (
          handleLinkClick ? (
            <Link
              href={cleanCurrentPath.replace(/\.md$/, "")} // Ensure we remove any .md extension
              className={cn(
                "flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-all duration-150",
                "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                pathname === cleanCurrentPath
                  ? "bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 dark:from-purple-900/10 dark:to-teal-900/5 dark:text-purple-400"
                  : "text-gray-700 dark:text-gray-200",
              )}
              onClick={handleLinkClick}
            >
              <Folder className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{name}</span>
            </Link>
          ) : (
            <Link
              href={cleanCurrentPath.replace(/\.md$/, "")} // Ensure we remove any .md extension
              className={cn(
                "flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-all duration-150",
                "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                pathname === cleanCurrentPath
                  ? "bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 dark:from-purple-900/10 dark:to-teal-900/5 dark:text-purple-400"
                  : "text-gray-700 dark:text-gray-200",
              )}
            >
              <Folder className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{name}</span>
            </Link>
          )
        ) : (
          <button
            onClick={handleClick}
            className={cn(
              "flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-all duration-150",
              "hover:bg-gray-100 dark:hover:bg-gray-800/50",
              isActive
                ? "bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 dark:from-purple-900/10 dark:to-teal-900/5 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-200",
            )}
          >
            <Folder className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="truncate">{name}</span>
          </button>
        )}
      </div>

      {isOpen && (
        <TreeNode
          tree={value}
          level={level}
          basePath={cleanCurrentPath.replace(/\.md$/, "")}
          onLinkClick={onLinkClick}
        />
      )}
    </li>
  );
}
