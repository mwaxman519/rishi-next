"use client";

import { useEffect } from "react";

// This component will only be rendered on the client side
export default function DevToolsScript() {
  useEffect(() => {
    // Set up chunk retry mechanism
    window.addEventListener("error", function (event) {
      // Only retry on chunk load errors
      if (event && event.message && event.message.includes("ChunkLoadError")) {
        console.log("Detected chunk load error, attempting to recover...");
        // Reload the page once to try recovering
        if (!sessionStorage.getItem("chunk_retry")) {
          sessionStorage.setItem("chunk_retry", "1");
          window.location.reload();
        }
      }
    });

    // This code will only run in the browser, after hydration
    const erudaScript = document.createElement("script");
    erudaScript.src = "/__replco/static/devtools/eruda/3.2.3/eruda.js";
    document.head.appendChild(erudaScript);
  }, []);

  return null;
}
