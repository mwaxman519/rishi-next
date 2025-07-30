&quot;use client&quot;;

import { useState, useEffect, Suspense } from &quot;react&quot;;
import { useSearchParams, useRouter } from &quot;next/navigation&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  ArrowLeft,
  Loader2,
  Users,
  Settings as SettingsIcon,
  PaintBucket,
} from &quot;lucide-react&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;
import { OrganizationUsers } from &quot;@/components/organizations/OrganizationUsers&quot;;
import type { Organization } from &quot;@shared/schema&quot;;

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
        <div className=&quot;flex items-center justify-center min-h-screen&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
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
  const [activeTab, setActiveTab] = useState(&quot;users&quot;);

  // Extract organization ID from URL
  useEffect(() => {
    const id = searchParams.get(&quot;organizationId&quot;);
    if (!id) {
      toast({
        title: &quot;Error&quot;,
        description: &quot;Organization ID is required&quot;,
        variant: &quot;destructive&quot;,
      });
      router.push(&quot;/admin/organizations&quot;);
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
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  const organization = orgData;

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex items-center mb-6&quot;>
        <Button
          variant=&quot;ghost&quot;
          onClick={() => router.push(&quot;/admin/organizations&quot;)}
          className=&quot;mr-4&quot;
        >
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
          Back to Organizations
        </Button>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Manage Organization
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            {organization?.name || &quot;Organization&quot;} - Manage users, settings, and
            branding
          </p>
        </div>
      </div>

      <Separator className=&quot;my-6&quot; />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className=&quot;space-y-4&quot;
      >
        <TabsList>
          <TabsTrigger value=&quot;users&quot; className=&quot;flex items-center&quot;>
            <Users className=&quot;h-4 w-4 mr-2&quot; />
            Users
          </TabsTrigger>
          <TabsTrigger value=&quot;settings&quot; className=&quot;flex items-center&quot;>
            <SettingsIcon className=&quot;h-4 w-4 mr-2&quot; />
            Settings
          </TabsTrigger>
          <TabsTrigger value=&quot;branding&quot; className=&quot;flex items-center&quot;>
            <PaintBucket className=&quot;h-4 w-4 mr-2&quot; />
            Branding
          </TabsTrigger>
        </TabsList>
        <TabsContent value=&quot;users&quot; className=&quot;space-y-4&quot;>
          <OrganizationUsers
            organizationId={organizationId}
            organizationName={organization?.name || &quot;Organization&quot;}
          />
        </TabsContent>
        <TabsContent value=&quot;settings&quot; className=&quot;space-y-4&quot;>
          <OrganizationSettings />
        </TabsContent>
        <TabsContent value=&quot;branding&quot; className=&quot;space-y-4&quot;>
          <OrganizationBranding />
        </TabsContent>
      </Tabs>
    </div>
  );
}
