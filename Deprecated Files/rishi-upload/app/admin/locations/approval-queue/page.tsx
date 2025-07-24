"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { PendingLocationsList } from "@/components/locations/PendingLocationsList";
import { ArrowLeft, ClipboardCheck, Map } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function LocationApprovalQueuePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Check if user has admin permissions
  const { data: hasPermission, error: permissionError } = useQuery({
    queryKey: ["/api/permissions/check", "manage:locations"],
    queryFn: async () => {
      const res = await fetch(
        "/api/permissions/check?permission=manage:locations",
      );
      if (!res.ok) {
        throw new Error("Failed to check permissions");
      }
      const data = await res.json();
      return data.hasPermission;
    },
  });

  // Redirect if user doesn't have admin permissions
  useEffect(() => {
    if (permissionError) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }

    if (hasPermission === false) {
      toast({
        title: "Access Denied",
        description:
          "You do not have permission to access the location approval queue.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [hasPermission, permissionError, router, toast]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumbs navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/locations">
              <Map className="h-3.5 w-3.5 inline-block mr-1" />
              Locations
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="font-semibold">
              <ClipboardCheck className="h-3.5 w-3.5 inline-block mr-1" />
              Approval Queue
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">
            Location Approval Queue
          </h1>
        </div>
        <p className="text-muted-foreground">
          Review and manage locations that require administrator approval before
          being published
        </p>
      </div>

      {/* Main content */}
      <Card className="p-6">
        <PendingLocationsList />
      </Card>
    </div>
  );
}
