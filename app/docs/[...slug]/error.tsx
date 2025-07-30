&quot;use client&quot;;

import React from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import Link from &quot;next/link&quot;;

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className=&quot;flex flex-col items-center justify-center min-h-[60vh] p-4&quot;>
      <Card className=&quot;w-full max-w-3xl&quot;>
        <CardHeader className=&quot;text-center&quot;>
          <CardTitle className=&quot;text-3xl text-red-600&quot;>
            Documentation Error
          </CardTitle>
          <CardDescription>
            There was a problem loading the documentation page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 mb-6&quot;>
            <p className=&quot;font-medium&quot;>Error: {error.message}</p>
            {error.digest && (
              <p className=&quot;text-sm mt-2&quot;>Digest: {error.digest}</p>
            )}
          </div>

          <div className=&quot;mt-4&quot;>
            <p>
              The documentation system encountered an error while trying to
              render this page. This could be due to:
            </p>
            <ul className=&quot;list-disc pl-6 mt-2 space-y-1&quot;>
              <li>A broken link or redirect</li>
              <li>Missing or corrupted documentation file</li>
              <li>An issue with the markdown processing</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className=&quot;flex flex-col sm:flex-row justify-center gap-4&quot;>
          <Button onClick={() => reset()} variant=&quot;default&quot;>
            Try Again
          </Button>
          <Button asChild variant=&quot;outline&quot;>
            <Link href=&quot;/docs&quot;>Documentation Home</Link>
          </Button>
          <Button asChild variant=&quot;outline&quot;>
            <Link href=&quot;/&quot;>Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
