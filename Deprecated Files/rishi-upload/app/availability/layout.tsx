"use client";

import React from "react";

interface AvailabilityLayoutProps {
  children: React.ReactNode;
}

// This layout specifically does NOT include a sidebar since the global layout already has one
export default function AvailabilityLayout({
  children,
}: AvailabilityLayoutProps) {
  return <div className="availability-layout">{children}</div>;
}
