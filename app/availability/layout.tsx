&quot;use client&quot;;

import React from &quot;react&quot;;

interface AvailabilityLayoutProps {
  children: React.ReactNode;
}

// This layout specifically does NOT include a sidebar since the global layout already has one
export default function AvailabilityLayout({
  children,
}: AvailabilityLayoutProps) {
  return <div className=&quot;availability-layout&quot;>{children}</div>;
}
