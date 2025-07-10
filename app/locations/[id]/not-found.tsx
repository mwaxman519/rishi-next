import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LocationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="text-center space-y-5 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">
          Location Not Found
        </h1>
        <p className="text-muted-foreground">
          The location you are looking for doesn't exist or you may not have
          permission to view it.
        </p>
        <Button asChild>
          <Link href="/locations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Locations
          </Link>
        </Button>
      </div>
    </div>
  );
}
