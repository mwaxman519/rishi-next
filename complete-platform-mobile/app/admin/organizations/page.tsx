"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building2, Settings, PaintBucket, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PermissionGuard } from "@/components/rbac/PermissionGuard";
import type { Organization } from "@shared/schema";

export default function OrganizationsPage() {
  const router = useRouter();

  const { data: organizationsData, isLoading } = useQuery<{
    organizations?: Organization[];
  }>({
    queryKey: ["/api/organizations"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const organizations = organizationsData?.organizations || [];

  return (
    <PermissionGuard 
      permission="manage:organizations"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to manage organizations.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage all organizations in the system
            </p>
          </div>
          <Button onClick={() => router.push("/admin/organizations/create")}>
            Add Organization
          </Button>
        </div>

      <Separator className="my-6" />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Organizations</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="partner">Partner</TabsTrigger>
        </TabsList>

        {["all", "internal", "client", "partner"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {organizations
                .filter((org) => tab === "all" || org.type === tab)
                .map((organization) => (
                  <Card key={organization.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{organization.name}</CardTitle>
                        <OrganizationBadge
                          type={organization.type}
                          tier={organization.tier}
                        />
                      </div>
                      <CardDescription>
                        ID: {organization.id.substring(0, 8)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{organization.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tier</p>
                          <p className="font-medium">
                            {organization.tier || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">
                            {organization.status === "active" ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-6 py-3">
                      <div className="flex items-center justify-between w-full">
                        <Link href={`/admin/organizations/${organization.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/organizations/manage?organizationId=${organization.id}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                            >
                              <Settings className="h-3.5 w-3.5" />
                              <span>Manage</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            {organizations.filter((org) => tab === "all" || org.type === tab)
              .length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No organizations found</h3>
                <p className="text-muted-foreground mt-2">
                  {tab === "all"
                    ? "There are no organizations in the system yet."
                    : `There are no ${tab} organizations in the system yet.`}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </PermissionGuard>
  );
}

function OrganizationBadge({
  type,
  tier,
}: {
  type: string;
  tier: string | null;
}) {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default";

  switch (type) {
    case "internal":
      variant = "default";
      break;
    case "client":
      variant = "secondary";
      break;
    case "partner":
      variant = "outline";
      break;
    default:
      variant = "default";
  }

  return (
    <div className="flex gap-2">
      <Badge variant={variant}>{type}</Badge>
      {tier && <Badge variant="outline">{tier.replace("_", " ")}</Badge>}
    </div>
  );
}
