import Link from &quot;next/link&quot;;

export default function NotFound() {
  return (
    <html lang=&quot;en&quot;>
      <head>
        <title>404 - Page Not Found | Rishi Platform</title>
      </head>
      <body>
        <div className=&quot;container py-20 text-center&quot;>
          <h1 className=&quot;mb-6 text-4xl font-bold gradient-heading md:text-5xl&quot;>
            404 - Page Not Found
          </h1>
          <p className=&quot;mx-auto mb-10 text-xl text-gray-600 dark:text-gray-400 max-w-2xl&quot;>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <Link href=&quot;/&quot; className=&quot;btn-primary&quot;>
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
