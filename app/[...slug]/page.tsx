/**
 * Dynamic route handler for catch-all routes
 * This handles all undefined routes and provides 404 functionality
 */

import { notFound } from 'next/navigation';

interface DynamicPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  // Return empty array for static export - all routes will be generated at build time
  return [];
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  // Await the params in Next.js 15
  const { slug } = await params;
  
  // For undefined routes, return 404
  notFound();
}