"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // Get organization details
  const { data: orgData, isLoading } = useQuery({
    queryKey: [`/api/organizations/${id}`],
    enabled: !!id,
  });

  // If organization not found or loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const organization = orgData;

  if (!organization) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/organizations")}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Not Found</CardTitle>
            <CardDescription>
              The organization with ID {id} could not be found.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/organizations")}>
              Back to Organizations
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const tierName = organization?.tier
    ? organization?.tier
        .replace("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "No Tier";

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/organizations")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {organization?.name || 'Unknown Organization'}
            </h1>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="mr-2">
                {organization?.type?.charAt(0).toUpperCase() +
                  organization?.type?.slice(1) || 'Unknown'}
              </Badge>
              {organization?.tier && (
                <Badge variant="secondary">{tierName}</Badge>
              )}
              <Badge
                variant={organization?.active ? "success" : "destructive"}
                className="ml-2"
              >
                {organization?.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/admin/organizations/settings?organizationId=${organization?.id}`}
          >
            <Button variant="outline" size="sm">
              Manage Settings
            </Button>
          </Link>
          <Link
            href={`/admin/organizations/branding?organizationId=${organization?.id}`}
          >
            <Button variant="outline" size="sm">
              Customize Branding
            </Button>
          </Link>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  ID
                </dt>
                <dd className="text-sm mt-1">{organization?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Type
                </dt>
                <dd className="text-sm mt-1 capitalize">{organization?.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tier
                </dt>
                <dd className="text-sm mt-1">{tierName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Status
                </dt>
                <dd className="text-sm mt-1">
                  {organization?.active ? "Active" : "Inactive"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created
                </dt>
                <dd className="text-sm mt-1">
                  {organization?.created_at ? new Date(organization?.created_at).toLocaleString() : 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </dt>
                <dd className="text-sm mt-1">
                  {organization?.updated_at ? new Date(organization?.updated_at).toLocaleString() : 'Unknown'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href={`/admin/organizations/users?organizationId=${organization?.id}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link
              href={`/admin/organizations/roles?organizationId=${organization?.id}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Manage Roles & Permissions
              </Button>
            </Link>
            <Link
              href={`/admin/organizations/settings?organizationId=${organization?.id}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Organization Settings
              </Button>
            </Link>
            <Link
              href={`/admin/organizations/branding?organizationId=${organization?.id}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Branding & Customization
              </Button>
            </Link>
            <Link
              href={`/admin/organization-regions?organizationId=${organization?.id}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Manage Regions
              </Button>
            </Link>
            <Link
              href={`/admin/organization-events?organizationId=${organization?.id}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
