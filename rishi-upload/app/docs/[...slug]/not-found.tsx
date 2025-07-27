"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DOC_PATH_REDIRECTS } from "../../lib/doc-redirects";

export default function DocsNotFound() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    // Get the current path from the URL
    const path = window.location.pathname.replace(/^\/docs\//, "");
    setCurrentPath(path);

    // Check for suggestions based on path
    const possibleSuggestions: string[] = [];

    // Check if we have a redirect for this path
    if (DOC_PATH_REDIRECTS[path]) {
      possibleSuggestions.push(`/docs/${DOC_PATH_REDIRECTS[path]}`);
    }

    // Add other potential matches
    Object.entries(DOC_PATH_REDIRECTS).forEach(([from, to]) => {
      if (from.includes(path) || path.includes(from)) {
        possibleSuggestions.push(`/docs/${to}`);
      }
    });

    // Set unique suggestions (limit to top 5)
    setSuggestions([...new Set(possibleSuggestions)].slice(0, 5));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Documentation Not Found</CardTitle>
          <CardDescription>
            The requested documentation page could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-lg text-center mb-6">
            <span className="font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
              {currentPath}
            </span>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Did you mean:</h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                  >
                    <Link
                      href={suggestion}
                      className="text-primary hover:underline block"
                    >
                      {suggestion}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              If you believe this is an error, please report it to the
              development team.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/docs">Documentation Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
