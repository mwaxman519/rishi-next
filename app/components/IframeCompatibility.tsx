"use client";

import { useEffect } from "react";

export default function IframeCompatibility({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Check if running in iframe and Replit environment
    const inIframe = typeof window !== 'undefined' && window.self !== window.top;
    const isReplit = typeof window !== 'undefined' && (
      window.location.hostname.includes("replit") ||
      window.location.hostname.includes("repl.it") ||
      (document.referrer && document.referrer.includes("replit"))
    );

    // Add iframe-specific styles for Replit
    if (inIframe && isReplit) {
      if (document.body) {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.overflow = "auto";
      }

      // Ensure the app fills the iframe
      const html = document.documentElement;
      if (html) {
        html.style.height = "100%";
        html.style.margin = "0";
        html.style.padding = "0";
      }

      console.log("Replit iframe compatibility enabled");
    }
  }, []);

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
