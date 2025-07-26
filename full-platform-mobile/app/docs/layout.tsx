"use client";

import React from "react";

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
    <React.Fragment key="docs-layout">
      {/* Always render children */}
      <div key="docs-content">{children}</div>
    </React.Fragment>
  );
}
