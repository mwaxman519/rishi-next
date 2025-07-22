"use client";

import React from "react";

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container py-6">{children}</div>;
}
