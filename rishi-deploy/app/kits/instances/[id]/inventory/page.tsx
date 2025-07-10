import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Kit Inventory ${params.id} | Rishi Platform`,
    description: "Manage kit inventory and component tracking",
  };
}

export default function KitInventoryPage({ params }: PageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/kits/instances/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Kit Details
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kit Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Inventory for kit instance: {id}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kit Inventory Management</CardTitle>
          <CardDescription>
            Inventory tracking will be available soon
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium">Coming Soon</h3>
          <p className="text-muted-foreground">
            Inventory management features are under development
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
