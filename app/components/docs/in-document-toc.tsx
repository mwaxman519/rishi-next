"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/client-utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface InDocumentTocProps {
  className?: string;
}

export function InDocumentToc({ className }: InDocumentTocProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from the document
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    // Find all headings (h2, h3, h4)
    const elements = article.querySelectorAll("h2, h3, h4");
    const extractedHeadings: Heading[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: parseInt(el.tagName.substring(1), 10),
    }));

    setHeadings(extractedHeadings);

    // Setup intersection observer to highlight active heading with improved precision
    const observer = new IntersectionObserver(
      (entries) => {
        // Get all entries that are currently intersecting
        const intersectingEntries = entries.filter(
          (entry) => entry.isIntersecting,
        );

        if (intersectingEntries.length) {
          // Find the heading closest to the top of the viewport
          const sortedEntries = intersectingEntries.sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
          if (sortedEntries.length > 0) {
            // Safely access and cast the target
            const entry = sortedEntries[0];
            if (entry && entry.target) {
              const target = entry.target as HTMLElement;
              if (target && target.id) {
                setActiveId(target.id);
              }
            }
          }
        }
      },
      {
        rootMargin: "-100px 0px -65% 0px", // Adjusted for header height and more precise tracking
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    // Observe all headings
    elements.forEach((heading) => observer.observe(heading));

    return () => {
      elements.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("text-sm", className)}>
      <h3 className="text-sm font-semibold mb-3 pb-2 border-b bg-gradient-to-r from-purple-600 to-teal-500 text-transparent bg-clip-text border-gray-200 dark:border-gray-700">
        On This Page
      </h3>
      <nav>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "leading-tight py-0.5",
                heading.level === 2 ? "ml-0" : "",
                heading.level === 3 ? "ml-3" : "",
                heading.level === 4 ? "ml-6" : "",
              )}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "inline-block transition-all duration-150 rounded-md px-1.5 py-1 text-sm",
                  "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50",
                  activeId === heading.id &&
                    "bg-gradient-to-r from-purple-100 to-teal-50 text-purple-700 font-medium dark:from-purple-900/20 dark:to-teal-900/20 dark:text-teal-300 dark:border dark:border-teal-800/40",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
