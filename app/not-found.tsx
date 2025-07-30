import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | Rishi Platform</title>
      </head>
      <body>
        <div className="container py-20 text-center">
          <h1 className="mb-6 text-4xl font-bold gradient-heading md:text-5xl">
            404 - Page Not Found
          </h1>
          <p className="mx-auto mb-10 text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
