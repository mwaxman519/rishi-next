"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Users,
  Settings as SettingsIcon,
  PaintBucket,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OrganizationUsers } from "@/components/organizations/OrganizationUsers";
import type { Organization } from "@shared/schema";

// Placeholder components for other tabs - will be implemented later
const OrganizationSettings = () => (
  <div>Organization Settings UI (Coming Soon)</div>
);
const OrganizationBranding = () => (
  <div>Organization Branding UI (Coming Soon)</div>
);

// Wrapper component with suspense boundary
export default function OrganizationManagePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrganizationManagePage />
    </Suspense>
  );
}

// Main component that uses useSearchParams
function OrganizationManagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  // Extract organization ID from URL
  useEffect(() => {
    const id = searchParams.get("organizationId");
    if (!id) {
      toast({
        title: "Error",
        description: "Organization ID is required",
        variant: "destructive",
      });
      router.push("/admin/organizations");
      return;
    }
    setOrganizationId(id);
  }, [searchParams, router]);

  // Get organization details
  const { data: orgData, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: [`/api/organizations/${organizationId}`],
    enabled: !!organizationId,
  });

  if (isOrgLoading || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const organization = orgData;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/organizations")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizations
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Organization
          </h1>
          <p className="text-muted-foreground">
            {organization?.name || "Organization"} - Manage users, settings, and
            branding
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center">
            <PaintBucket className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <OrganizationUsers
            organizationId={organizationId}
            organizationName={organization?.name || "Organization"}
          />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <OrganizationSettings />
        </TabsContent>
        <TabsContent value="branding" className="space-y-4">
          <OrganizationBranding />
        </TabsContent>
      </Tabs>
    </div>
  );
}
