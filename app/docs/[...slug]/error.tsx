"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-red-600">
            Documentation Error
          </CardTitle>
          <CardDescription>
            There was a problem loading the documentation page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 mb-6">
            <p className="font-medium">Error: {error.message}</p>
            {error.digest && (
              <p className="text-sm mt-2">Digest: {error.digest}</p>
            )}
          </div>

          <div className="mt-4">
            <p>
              The documentation system encountered an error while trying to
              render this page. This could be due to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>A broken link or redirect</li>
              <li>Missing or corrupted documentation file</li>
              <li>An issue with the markdown processing</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => reset()} variant="default">
            Try Again
          </Button>
          <Button asChild variant="outline">
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
