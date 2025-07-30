&quot;use client&quot;;

import React, {
  useState,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
} from &quot;react&quot;;
import NextLink from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { ChevronDown, ChevronRight, File, Folder } from &quot;lucide-react&quot;;
import { cn } from &quot;../../lib/client-utils&quot;;
import type { DocTree } from &quot;../../lib/docs&quot;;

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
  if (process.env.NODE_ENV !== &quot;production&quot;) {
    if (tree) {
      console.log(&quot;TableOfContents: Tree root keys:&quot;, Object.keys(tree));
    } else {
      console.warn(&quot;TableOfContents: No tree object provided&quot;);
    }
  }

  // Get the current pathname to determine the active link
  const pathname = usePathname();
  // Always use /docs as the base path for document tree links
  const basePath = &quot;/docs&quot;;

  return (
    <nav className={cn(&quot;text-sm&quot;, className)}>
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
  if (process.env.NODE_ENV !== &quot;production&quot;) {
    console.log(`TreeNode at ${basePath} has entries:`, Object.keys(tree));
  }

  // Ensure we have a valid tree object
  if (!tree || typeof tree !== &quot;object&quot;) {
    if (process.env.NODE_ENV !== &quot;production&quot;) {
      console.error(`Invalid tree at ${basePath}: `, tree);
    }
    return null;
  }

  // Find README files first to ensure they&apos;re displayed at the top of their directory
  let entries = Object.entries(tree);
  let readmeEntry = entries.find(
    ([key]) => key === &quot;README.md&quot; || key === &quot;README.mdx&quot; || key === &quot;README&quot;,
  );

  // Collect directories and files separately
  // For directories, check if they have a README to avoid showing both &quot;api&quot; and then &quot;api/Overview&quot;
  const directories = entries
    .filter(
      ([key, value]) =>
        value !== null &&
        key !== &quot;README.md&quot; &&
        key !== &quot;README.mdx&quot; &&
        key !== &quot;README&quot;,
    )
    .sort((a, b) => a[0].localeCompare(b[0])); // Sort directories alphabetically

  const files = entries
    .filter(
      ([key, value]) =>
        value === null &&
        key !== &quot;README.md&quot; &&
        key !== &quot;README.mdx&quot; &&
        key !== &quot;README&quot;,
    )
    .sort((a, b) => a[0].localeCompare(b[0])); // Sort files alphabetically

  // Debug the collected directories and files (development only)
  if (process.env.NODE_ENV !== &quot;production&quot;) {
    console.log(
      `TreeNode at ${basePath}: Found ${directories.length} directories and ${files.length} files`,
    );
  }

  // If we have no content, try to reinitialize (client-side only)
  if (
    directories.length === 0 &&
    files.length === 0 &&
    typeof window !== &quot;undefined&quot;
  ) {
    console.warn(
      `[DOCS TOC] Empty tree at ${basePath}, attempting to reinitialize...`,
    );
    // Try to initialize docs in the background - fetch directly (don&apos;t await)
    fetch(&quot;/api/docs/init&quot;)
      .then((response) => {
        if (response.ok) {
          console.log(
            &quot;[DOCS TOC] Reinitialization succeeded, refreshing page...&quot;,
          );
          // Reload the page after a short delay if we successfully initialized
          setTimeout(() => window.location.reload(), 1000);
        } else {
          console.error(&quot;[DOCS TOC] Reinitialization failed&quot;);
        }
      })
      .catch((err) => {
        console.error(&quot;[DOCS TOC] Reinitialization error:&quot;, err);
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
    <ul className={cn(&quot;space-y-0.5&quot;, level > 0 && &quot;ml-3 mt-0.5&quot;)}>
      {/* Display README first as &quot;Overview&quot; for the current directory */}
      {/* Only display &quot;Overview&quot; if we&apos;re at the root level (not inside a directory) */}
      {readmeEntry && (level === 0 || basePath === &quot;/docs&quot;) && (
        <li key={readmeEntry[0]}>
          {handleClick ? (
            <Link
              href={`${basePath}`} // Link directly to directory path, which shows README
              className={cn(
                &quot;flex items-center gap-2 py-1 px-2 rounded-md text-sm&quot;,
                &quot;text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50&quot;,
                pathname === basePath &&
                  &quot;bg-gradient-to-r from-purple-100 to-teal-50 text-purple-700 dark:from-purple-900/20 dark:to-teal-900/10 dark:text-purple-300&quot;,
              )}
              onClick={handleClick}
            >
              <File className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
              <span className=&quot;truncate&quot;>Overview</span>
            </Link>
          ) : (
            <Link
              href={`${basePath}`} // Link directly to directory path, which shows README
              className={cn(
                &quot;flex items-center gap-2 py-1 px-2 rounded-md text-sm&quot;,
                &quot;text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50&quot;,
                pathname === basePath &&
                  &quot;bg-gradient-to-r from-purple-100 to-teal-50 text-purple-700 dark:from-purple-900/20 dark:to-teal-900/10 dark:text-purple-300&quot;,
              )}
            >
              <File className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
              <span className=&quot;truncate&quot;>Overview</span>
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
        const displayText = key.replace(/\.[^/.]+$/, "&quot;); // Remove file extension
        const pathKey = key.replace(/\.[^/.]+$/, &quot;&quot;); // Remove file extension for path

        // Always use the base path and the clean key without any extension
        // This ensures we don&apos;t append .md to the URLs
        const currentPath = `${basePath}/${pathKey}`.replace(/\.md$/, &quot;&quot;);
        const isActive = pathname === currentPath;

        // Log the file path we&apos;re creating (development only)
        if (process.env.NODE_ENV !== &quot;production&quot;) {
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
                  &quot;flex items-center gap-2 py-1 px-2 rounded-md text-sm&quot;,
                  &quot;text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50&quot;,
                  isActive &&
                    &quot;bg-gradient-to-r from-teal-100 to-purple-50 text-teal-700 dark:from-teal-900/20 dark:to-purple-900/10 dark:text-teal-300&quot;,
                )}
                onClick={handleClick}
              >
                <File className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
                <span className=&quot;truncate&quot;>{displayText}</span>
              </Link>
            ) : (
              <Link
                href={currentPath}
                className={cn(
                  &quot;flex items-center gap-2 py-1 px-2 rounded-md text-sm&quot;,
                  &quot;text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50&quot;,
                  isActive &&
                    &quot;bg-gradient-to-r from-teal-100 to-purple-50 text-teal-700 dark:from-teal-900/20 dark:to-purple-900/10 dark:text-teal-300&quot;,
                )}
              >
                <File className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
                <span className=&quot;truncate&quot;>{displayText}</span>
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
  const isEndpointsDir = name === &quot;endpoints&quot; && basePath.includes(&quot;/api&quot;);
  const [isOpen, setIsOpen] = useState(isActive || isEndpointsDir);
  const pathname = usePathname();

  // Debug the contents of this directory (development only)
  if (process.env.NODE_ENV !== &quot;production&quot;) {
    console.log(
      `Directory ${name} at path ${basePath} has files:`,
      Object.keys(value),
    );
  }

  // Ensure directory value is valid
  if (!value || typeof value !== &quot;object&quot;) {
    if (process.env.NODE_ENV !== &quot;production&quot;) {
      console.error(
        `Invalid directory value for ${name} at ${basePath}:`,
        value,
      );
    }
    return null;
  }

  // Check if this directory has a README.md or README.mdx file
  const hasReadme = Object.keys(value).some(
    (key) => key === &quot;README.md&quot; || key === &quot;README.mdx&quot; || key === &quot;README&quot;,
  );

  // Clean the path to ensure it doesn&apos;t have double slashes
  // This is a safeguard against paths like /docs//directory
  const cleanCurrentPath = currentPath.replace(/\/+/g, &quot;/&quot;);

  // Log the path info (development only)
  if (process.env.NODE_ENV !== &quot;production&quot;) {
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
  if (process.env.NODE_ENV !== &quot;production&quot;) {
    console.log(
      `[TOC] Rendering directory node: ${name}, path: ${cleanCurrentPath}`,
    );
  }

  return (
    <li>
      <div className=&quot;flex items-center&quot;>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className=&quot;p-1 mr-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800/50&quot;
        >
          {isOpen ? (
            <ChevronDown className=&quot;h-4 w-4 flex-shrink-0 transition-transform duration-150 text-gray-400&quot; />
          ) : (
            <ChevronRight className=&quot;h-4 w-4 flex-shrink-0 transition-transform duration-150 text-gray-400&quot; />
          )}
        </button>

        {hasReadme ? (
          handleLinkClick ? (
            <Link
              href={cleanCurrentPath.replace(/\.md$/, &quot;&quot;)} // Ensure we remove any .md extension
              className={cn(
                &quot;flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-all duration-150&quot;,
                &quot;hover:bg-gray-100 dark:hover:bg-gray-800/50&quot;,
                pathname === cleanCurrentPath
                  ? &quot;bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 dark:from-purple-900/10 dark:to-teal-900/5 dark:text-purple-400&quot;
                  : &quot;text-gray-700 dark:text-gray-200&quot;,
              )}
              onClick={handleLinkClick}
            >
              <Folder className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
              <span className=&quot;truncate&quot;>{name}</span>
            </Link>
          ) : (
            <Link
              href={cleanCurrentPath.replace(/\.md$/, &quot;&quot;)} // Ensure we remove any .md extension
              className={cn(
                &quot;flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-all duration-150&quot;,
                &quot;hover:bg-gray-100 dark:hover:bg-gray-800/50&quot;,
                pathname === cleanCurrentPath
                  ? &quot;bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 dark:from-purple-900/10 dark:to-teal-900/5 dark:text-purple-400&quot;
                  : &quot;text-gray-700 dark:text-gray-200&quot;,
              )}
            >
              <Folder className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
              <span className=&quot;truncate&quot;>{name}</span>
            </Link>
          )
        ) : (
          <button
            onClick={handleClick}
            className={cn(
              &quot;flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-all duration-150&quot;,
              &quot;hover:bg-gray-100 dark:hover:bg-gray-800/50&quot;,
              isActive
                ? &quot;bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 dark:from-purple-900/10 dark:to-teal-900/5 dark:text-purple-400&quot;
                : &quot;text-gray-700 dark:text-gray-200&quot;,
            )}
          >
            <Folder className=&quot;h-4 w-4 flex-shrink-0 text-gray-400&quot; />
            <span className=&quot;truncate&quot;>{name}</span>
          </button>
        )}
      </div>

      {isOpen && (
        <TreeNode
          tree={value}
          level={level}
          basePath={cleanCurrentPath.replace(/\.md$/, &quot;")}
          onLinkClick={onLinkClick}
        />
      )}
    </li>
  );
}
