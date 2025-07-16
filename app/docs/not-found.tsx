import Link from 'next/link';

export default function DocsNotFound() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
          Documentation Not Found
        </h3>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
          The requested documentation page could not be found. It may have been moved or is no longer available.
        </p>
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Return to Home
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Documentation Index
          </Link>
        </div>
      </div>
    </div>
  );
}