&quot;use client&quot;;

import React, { useEffect, useState } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { DOC_PATH_REDIRECTS } from &quot;../../lib/doc-redirects&quot;;

export default function DocsNotFound() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("&quot;);

  useEffect(() => {
    // Get the current path from the URL
    const path = window.location.pathname.replace(/^\/docs\//, &quot;&quot;);
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
    <div className=&quot;flex flex-col items-center justify-center min-h-[60vh] p-4&quot;>
      <Card className=&quot;w-full max-w-3xl&quot;>
        <CardHeader className=&quot;text-center&quot;>
          <CardTitle className=&quot;text-3xl&quot;>Documentation Not Found</CardTitle>
          <CardDescription>
            The requested documentation page could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;text-lg text-center mb-6&quot;>
            <span className=&quot;font-mono bg-muted text-muted-foreground px-2 py-1 rounded&quot;>
              {currentPath}
            </span>
          </div>

          {suggestions.length > 0 && (
            <div className=&quot;mt-6&quot;>
              <h3 className=&quot;text-lg font-semibold mb-3&quot;>Did you mean:</h3>
              <ul className=&quot;space-y-2&quot;>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className=&quot;p-2 bg-muted/50 rounded hover:bg-muted transition-colors&quot;
                  >
                    <Link
                      href={suggestion}
                      className=&quot;text-primary hover:underline block&quot;
                    >
                      {suggestion}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className=&quot;mt-8 text-sm text-muted-foreground&quot;>
            <p>
              If you believe this is an error, please report it to the
              development team.
            </p>
          </div>
        </CardContent>
        <CardFooter className=&quot;flex justify-center gap-4&quot;>
          <Button asChild variant=&quot;default&quot;>
            <Link href=&quot;/docs&quot;>Documentation Home</Link>
          </Button>
          <Button asChild variant=&quot;outline&quot;>
            <Link href=&quot;/">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
