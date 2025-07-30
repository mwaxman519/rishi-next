&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Plus, Building2, Users, Settings, ChevronRight } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useOrganization } from &quot;@/contexts/OrganizationProvider&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;
import { AuthGuard } from &quot;@/components/AuthGuard&quot;;

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
      console.log(&quot;User not authenticated, redirecting to login&quot;);
      router.push(&quot;/auth/login&quot;);
      return;
    }
  }, [user, authLoading, router]);

  // Query to get all organizations for super admin
  const { data: allOrganizations = [], isLoading } = useQuery({
    queryKey: [&quot;/api/organizations&quot;],
    enabled: isSuperAdmin,
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4&quot;></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <div className=&quot;text-center&quot;>
          <h2 className=&quot;text-xl font-semibold mb-2&quot;>Authentication Required</h2>
          <p className=&quot;text-muted-foreground mb-4&quot;>Please log in to access organizations</p>
          <Button onClick={() => router.push(&quot;/auth/login&quot;)}>
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
        title: &quot;Success&quot;,
        description: &quot;Organization switched successfully&quot;,
      });
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to switch organization&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  const handleManageOrganization = (orgId: string) => {
    router.push(`/admin/organizations/settings?organizationId=${orgId}`);
  };

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex items-center justify-between mb-6&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Organizations</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage your organization memberships and settings
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => router.push(&quot;/admin/organizations/create&quot;)}>
            <Plus className=&quot;h-4 w-4 mr-2&quot; />
            Create Organization
          </Button>
        )}
      </div>

      <Separator className=&quot;my-6&quot; />

      {/* Current Organization */}
      {currentOrganization && (
        <div className=&quot;mb-8&quot;>
          <h2 className=&quot;text-xl font-semibold mb-4&quot;>Current Organization</h2>
          <Card className=&quot;border-2 border-primary&quot;>
            <CardHeader>
              <CardTitle className=&quot;flex items-center justify-between&quot;>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Building2 className=&quot;h-5 w-5 text-primary&quot; />
                  <span>{currentOrganization.name}</span>
                  <Badge variant=&quot;outline&quot;>{currentOrganization.role}</Badge>
                </div>
                <Button
                  variant=&quot;ghost&quot;
                  size=&quot;sm&quot;
                  onClick={() => handleManageOrganization(currentOrganization.id)}
                >
                  <Settings className=&quot;h-4 w-4 mr-2&quot; />
                  Manage
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4 text-sm&quot;>
                <div>
                  <span className=&quot;font-medium&quot;>Type:</span> {currentOrganization.type}
                </div>
                <div>
                  <span className=&quot;font-medium&quot;>Tier:</span> {currentOrganization.tier}
                </div>
                <div>
                  <span className=&quot;font-medium&quot;>Role:</span> {currentOrganization.role}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Organizations */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>
          {isSuperAdmin ? &quot;All Organizations&quot; : &quot;Available Organizations&quot;}
        </h2>
        
        {isLoading ? (
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className=&quot;animate-pulse&quot;>
                <CardHeader>
                  <div className=&quot;h-6 bg-gray-200 rounded w-3/4 mb-2&quot;></div>
                  <div className=&quot;h-4 bg-gray-200 rounded w-1/2&quot;></div>
                </CardHeader>
                <CardContent>
                  <div className=&quot;h-4 bg-gray-200 rounded w-full mb-2&quot;></div>
                  <div className=&quot;h-4 bg-gray-200 rounded w-2/3&quot;></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className=&quot;text-center py-8&quot;>
              <Building2 className=&quot;h-12 w-12 text-muted-foreground mx-auto mb-4&quot; />
              <h3 className=&quot;text-lg font-semibold mb-2&quot;>No Organizations Found</h3>
              <p className=&quot;text-muted-foreground&quot;>
                {isSuperAdmin 
                  ? &quot;No organizations have been created yet.&quot;
                  : &quot;You don&apos;t have access to any organizations.&quot;}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
            {organizations.map((org) => (
              <Card 
                key={org.id} 
                className={`hover:shadow-lg transition-shadow ${
                  currentOrganization?.id === org.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <Building2 className=&quot;h-5 w-5 text-primary&quot; />
                      <span className=&quot;truncate&quot;>{org.name}</span>
                    </div>
                    <Badge variant=&quot;outline&quot;>{org.role || org.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=&quot;space-y-2 text-sm&quot;>
                    <div className=&quot;flex justify-between&quot;>
                      <span className=&quot;text-muted-foreground&quot;>Type:</span>
                      <span className=&quot;font-medium&quot;>{org.type}</span>
                    </div>
                    <div className=&quot;flex justify-between&quot;>
                      <span className=&quot;text-muted-foreground&quot;>Tier:</span>
                      <span className=&quot;font-medium&quot;>{org.tier}</span>
                    </div>
                    {org.members_count && (
                      <div className=&quot;flex justify-between&quot;>
                        <span className=&quot;text-muted-foreground&quot;>Members:</span>
                        <span className=&quot;font-medium&quot;>{org.members_count}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className=&quot;flex space-x-2 mt-4&quot;>
                    {currentOrganization?.id !== org.id && (
                      <Button
                        variant=&quot;outline&quot;
                        size=&quot;sm&quot;
                        onClick={() => handleSwitchOrganization(org.id)}
                        className=&quot;flex-1&quot;
                      >
                        Switch To
                      </Button>
                    )}
                    <Button
                      variant=&quot;ghost&quot;
                      size=&quot;sm&quot;
                      onClick={() => handleManageOrganization(org.id)}
                      className=&quot;flex items-center&quot;
                    >
                      <Settings className=&quot;h-4 w-4 mr-1&quot; />
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