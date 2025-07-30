&quot;use client&quot;;

import React from &quot;react&quot;;

/**
 * Layout wrapper for all documentation pages
 * Provides consistent structure for docs pages
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Fragment key=&quot;docs-layout&quot;>
      {/* Always render children */}
      <div key=&quot;docs-content&quot;>{children}</div>
    </React.Fragment>
  );
}
