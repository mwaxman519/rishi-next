"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Building2, Users, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationProvider";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";

interface Organization {
  id: string;
  name: string;
  type: string;
  tier: string;
  role: string;
  created_at: string;
  updated_at: string;
  members_count?: number;
  status?: string;
}

function OrganizationsPageContent() {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const { currentOrganization, userOrganizations, switchOrganization } = useOrganization();
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/auth/login");
      return;
    }
  }, [user, authLoading, router]);

  // Query to get all organizations for super admin
  const { data: allOrganizations = [], isLoading } = useQuery({
    queryKey: ["/api/organizations"],
    enabled: isSuperAdmin,
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access organizations</p>
          <Button onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // For super admin, show all organizations. For others, show their organizations
  const organizations = isSuperAdmin ? allOrganizations : userOrganizations;

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      toast({
        title: "Success",
        description: "Organization switched successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch organization",
        variant: "destructive",
      });
    }
  };

  const handleManageOrganization = (orgId: string) => {
    router.push(`/admin/organizations/settings?organizationId=${orgId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organization memberships and settings
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => router.push("/admin/organizations/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        )}
      </div>

      <Separator className="my-6" />

      {/* Current Organization */}
      {currentOrganization && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Organization</h2>
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>{currentOrganization.name}</span>
                  <Badge variant="outline">{currentOrganization.role}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleManageOrganization(currentOrganization.id)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {currentOrganization.type}
                </div>
                <div>
                  <span className="font-medium">Tier:</span> {currentOrganization.tier}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {currentOrganization.role}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Organizations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isSuperAdmin ? "All Organizations" : "Available Organizations"}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organizations Found</h3>
              <p className="text-muted-foreground">
                {isSuperAdmin 
                  ? "No organizations have been created yet."
                  : "You don't have access to any organizations."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card 
                key={org.id} 
                className={`hover:shadow-lg transition-shadow ${
                  currentOrganization?.id === org.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    <Badge variant="outline">{org.role || org.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{org.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier:</span>
                      <span className="font-medium">{org.tier}</span>
                    </div>
                    {org.members_count && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members:</span>
                        <span className="font-medium">{org.members_count}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    {currentOrganization?.id !== org.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchOrganization(org.id)}
                        className="flex-1"
                      >
                        Switch To
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageOrganization(org.id)}
                      className="flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrganizationsPageContent />
    </AuthGuard>
  );
}