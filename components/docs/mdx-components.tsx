&quot;use client&quot;;

import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;
import { cn } from &quot;@/components/../lib/client-utils&quot;;

// Helper to add ID to headings for anchor links
function HeadingWithAnchor({
  as: Component,
  id,
  className,
  ...props
}: {
  as: React.ElementType;
  id?: string;
  className?: string;
  [key: string]: any;
}) {
  const generatedId =
    id ||
    props.children
      ?.toString()
      .toLowerCase()
      .replace(/\s+/g, &quot;-&quot;)
      .replace(/[^\w-]/g, "&quot;);

  return (
    <Component
      id={generatedId}
      className={cn(&quot;scroll-mt-20 group flex items-center&quot;, className)}
      {...props}
    >
      <span>{props.children}</span>
      {generatedId && (
        <a
          href={`#${generatedId}`}
          className=&quot;ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-opacity&quot;
          aria-label=&quot;Anchor to section&quot;
        >
          #
        </a>
      )}
    </Component>
  );
}

// Custom components for MDX content
export const MDXComponents = {
  // Headings with gradient text
  h1: (props: any) => (
    <HeadingWithAnchor
      as=&quot;h1&quot;
      className=&quot;text-3xl font-bold mt-8 mb-4 bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300&quot;
      {...props}
    />
  ),
  h2: (props: any) => (
    <HeadingWithAnchor
      as=&quot;h2&quot;
      className=&quot;text-2xl font-bold mt-8 mb-4 bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300&quot;
      {...props}
    />
  ),
  h3: (props: any) => (
    <HeadingWithAnchor
      as=&quot;h3&quot;
      className=&quot;text-xl font-bold mt-6 mb-3 bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300&quot;
      {...props}
    />
  ),
  h4: (props: any) => (
    <HeadingWithAnchor
      as=&quot;h4&quot;
      className=&quot;text-lg font-bold mt-4 mb-2 bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300&quot;
      {...props}
    />
  ),
  h5: (props: any) => (
    <HeadingWithAnchor
      as=&quot;h5&quot;
      className=&quot;text-base font-bold mt-4 mb-2 bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300&quot;
      {...props}
    />
  ),
  h6: (props: any) => (
    <HeadingWithAnchor
      as=&quot;h6&quot;
      className=&quot;text-sm font-bold mt-4 mb-2 bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-teal-300&quot;
      {...props}
    />
  ),

  // Basic elements
  p: (props: any) => (
    <p className=&quot;mb-4 leading-7 text-gray-700 dark:text-gray-300&quot; {...props} />
  ),
  a: ({ href, ...props }: any) => {
    // Handle absolute URLs or anchor links
    if (href.startsWith(&quot;http&quot;) || href.startsWith(&quot;#&quot;)) {
      return (
        <a
          href={href}
          className=&quot;text-purple-600 dark:text-teal-400 hover:underline font-medium&quot;
          target={href.startsWith(&quot;http&quot;) ? &quot;_blank&quot; : undefined}
          rel={href.startsWith(&quot;http&quot;) ? &quot;noopener noreferrer&quot; : undefined}
          {...props}
        />
      );
    }

    // Handle internal links
    return (
      <Link
        href={href}
        className=&quot;text-purple-600 dark:text-teal-400 hover:underline font-medium&quot;
        {...props}
      />
    );
  },

  // Lists
  ul: (props: any) => (
    <ul
      className=&quot;list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300&quot;
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className=&quot;list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300&quot;
      {...props}
    />
  ),
  li: (props: any) => <li className=&quot;mb-1&quot; {...props} />,

  // Block elements
  hr: (props: any) => (
    <hr className=&quot;my-8 border-gray-200 dark:border-gray-700&quot; {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      className=&quot;border-l-4 border-l-purple-500 dark:border-l-teal-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300 bg-purple-50/50 dark:bg-teal-900/10 py-2 pr-2 rounded-r-md&quot;
      {...props}
    />
  ),

  // Tables
  table: (props: any) => (
    <div className=&quot;overflow-x-auto mb-6&quot;>
      <table className=&quot;w-full border-collapse text-sm&quot; {...props} />
    </div>
  ),
  thead: (props: any) => (
    <thead className=&quot;bg-gray-50 dark:bg-gray-800&quot; {...props} />
  ),
  tbody: (props: any) => (
    <tbody
      className=&quot;divide-y divide-gray-200 dark:divide-gray-700&quot;
      {...props}
    />
  ),
  tr: (props: any) => (
    <tr className=&quot;even:bg-gray-50 dark:even:bg-gray-800/50&quot; {...props} />
  ),
  th: (props: any) => (
    <th
      className=&quot;px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300&quot;
      {...props}
    />
  ),
  td: (props: any) => (
    <td className=&quot;px-4 py-3 text-gray-700 dark:text-gray-300&quot; {...props} />
  ),

  // Code blocks
  pre: (props: any) => (
    <pre
      className=&quot;rounded-lg bg-gray-900 p-4 overflow-x-auto text-sm text-white my-6&quot;
      {...props}
    />
  ),
  code: ({ className, ...props }: any) => {
    // If it&apos;s a code block (with language className from highlight.js)
    if (className?.startsWith(&quot;language-&quot;)) {
      return <code className={cn(className, &quot;block&quot;)} {...props} />;
    }
    // For inline code
    return (
      <code
        className=&quot;rounded bg-purple-50 px-1.5 py-0.5 font-mono text-sm text-purple-800 dark:bg-purple-900/30 dark:text-teal-300 rounded-md&quot;
        {...props}
      />
    );
  },

  // Custom components
  Image: (props: any) => (
    <div className=&quot;my-6&quot;>
      <Image
        className=&quot;rounded-lg mx-auto&quot;
        {...props}
        alt={props.alt || &quot;Documentation image&quot;}
        sizes=&quot;(min-width: 1024px) 80vw, 100vw&quot;
      />
      {props.caption && (
        <figcaption className=&quot;mt-2 text-center text-sm text-gray-500 dark:text-gray-400&quot;>
          {props.caption}
        </figcaption>
      )}
    </div>
  ),

  // Alert components
  Tip: ({ children }: any) => (
    <div className=&quot;rounded-lg border-l-4 border-green-500 bg-green-50 p-4 mb-4 dark:bg-green-500/10 dark:border-green-400&quot;>
      <div className=&quot;flex&quot;>
        <div className=&quot;flex-shrink-0&quot;>
          <svg
            className=&quot;h-5 w-5 text-green-600 dark:text-green-400&quot;
            viewBox=&quot;0 0 20 20&quot;
            fill=&quot;currentColor&quot;
          >
            <path
              fillRule=&quot;evenodd&quot;
              d=&quot;M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z&quot;
              clipRule=&quot;evenodd&quot;
            />
          </svg>
        </div>
        <div className=&quot;ml-3&quot;>
          <p className=&quot;text-sm text-green-700 dark:text-green-400&quot;>
            {children}
          </p>
        </div>
      </div>
    </div>
  ),

  Warning: ({ children }: any) => (
    <div className=&quot;rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 mb-4 dark:bg-yellow-500/10 dark:border-yellow-400&quot;>
      <div className=&quot;flex&quot;>
        <div className=&quot;flex-shrink-0&quot;>
          <svg
            className=&quot;h-5 w-5 text-yellow-600 dark:text-yellow-400&quot;
            viewBox=&quot;0 0 20 20&quot;
            fill=&quot;currentColor&quot;
          >
            <path
              fillRule=&quot;evenodd&quot;
              d=&quot;M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z&quot;
              clipRule=&quot;evenodd&quot;
            />
          </svg>
        </div>
        <div className=&quot;ml-3&quot;>
          <p className=&quot;text-sm text-yellow-700 dark:text-yellow-400&quot;>
            {children}
          </p>
        </div>
      </div>
    </div>
  ),

  Danger: ({ children }: any) => (
    <div className=&quot;rounded-lg border-l-4 border-red-500 bg-red-50 p-4 mb-4 dark:bg-red-500/10 dark:border-red-400&quot;>
      <div className=&quot;flex&quot;>
        <div className=&quot;flex-shrink-0&quot;>
          <svg
            className=&quot;h-5 w-5 text-red-600 dark:text-red-400&quot;
            viewBox=&quot;0 0 20 20&quot;
            fill=&quot;currentColor&quot;
          >
            <path
              fillRule=&quot;evenodd&quot;
              d=&quot;M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z&quot;
              clipRule=&quot;evenodd&quot;
            />
          </svg>
        </div>
        <div className=&quot;ml-3&quot;>
          <p className=&quot;text-sm text-red-700 dark:text-red-400&quot;>{children}</p>
        </div>
      </div>
    </div>
  ),

  Info: ({ children }: any) => (
    <div className=&quot;rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 mb-4 dark:bg-blue-500/10 dark:border-blue-400&quot;>
      <div className=&quot;flex&quot;>
        <div className=&quot;flex-shrink-0&quot;>
          <svg
            className=&quot;h-5 w-5 text-blue-600 dark:text-blue-400&quot;
            viewBox=&quot;0 0 20 20&quot;
            fill=&quot;currentColor&quot;
          >
            <path
              fillRule=&quot;evenodd&quot;
              d=&quot;M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z&quot;
              clipRule=&quot;evenodd&quot;
            />
          </svg>
        </div>
        <div className=&quot;ml-3&quot;>
          <p className=&quot;text-sm text-blue-700 dark:text-blue-400">{children}</p>
        </div>
      </div>
    </div>
  ),
};
