import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminLocationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="text-center space-y-5 max-w-md">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Location Not Found
        </h1>
        <p className=&quot;text-muted-foreground>
          The location you are looking for doesn&apos;t exist or you may not have
          permission to view it.
        </p>
        <Button asChild>
          <Link href="/admin/locations">
            <ArrowLeft className=&quot;mr-2 h-4 w-4 />
            Back to Location Management
          </Link>
        </Button>
      </div>
    </div>
  );
}
