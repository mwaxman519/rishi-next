import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Kit Instance ${id} | Rishi Platform`,
    description: "Kit instance details and management",
  };
}

export default async function KitInstanceDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kit Instance Details
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing kit instance: {id}
          </p>
        </div>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Kit Instance Management</h3>
        <p className="text-muted-foreground">
          Kit instance details will be available soon
        </p>
      </div>
    </div>
  );
}
