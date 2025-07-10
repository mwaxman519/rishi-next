/**
 * Dynamic route handler for catch-all routes
 * This handles all undefined routes and provides 404 functionality
 */

import { notFound } from 'next/navigation';

interface DynamicPageProps {
  params: {
    slug: string[];
  };
}

export async function generateStaticParams() {
  // Return empty array for static export - all routes will be generated at build time
  return [];
}

export default function DynamicPage({ params }: DynamicPageProps) {
  // For undefined routes, return 404
  notFound();
}