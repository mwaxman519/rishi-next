import { notFound, redirect } from "next/navigation";
import { getDocumentByPath, getDocTree, getAllDocs } from "@/lib/docs-production";

// Minimal docs page for autoscale deployment
export default async function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Documentation</h1>
      <p className="text-gray-600">
        Documentation will be available after deployment completes.
      </p>
    </div>
  );
}

// Skip all static generation for fast autoscale deployment
export async function generateStaticParams() {
  console.log("[DOCS generateStaticParams] Skipping all docs generation for autoscale deployment");
  return [];
}
