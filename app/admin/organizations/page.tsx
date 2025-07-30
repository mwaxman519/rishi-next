&quot;use client&quot;;

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Building2, Settings, PaintBucket, Shield, Users } from &quot;lucide-react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import Link from &quot;next/link&quot;;
import { PermissionGuard } from &quot;@/components/rbac/PermissionGuard&quot;;
import type { Organization } from &quot;@shared/schema&quot;;

export default function OrganizationsPage() {
  const router = useRouter();

  const { data: organizationsData, isLoading } = useQuery<{
    organizations?: Organization[];
  }>({
    queryKey: [&quot;/api/organizations&quot;],
  });

  if (isLoading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  const organizations = organizationsData?.organizations || [];

  return (
    <PermissionGuard 
      permission=&quot;manage:organizations&quot;
      fallback={
        <div className=&quot;flex items-center justify-center min-h-screen&quot;>
          <div className=&quot;text-center&quot;>
            <h2 className=&quot;text-lg font-semibold mb-2&quot;>Access Denied</h2>
            <p className=&quot;text-muted-foreground&quot;>You don&apos;t have permission to manage organizations.</p>
          </div>
        </div>
      }
    >
      <div className=&quot;container mx-auto py-6&quot;>
        <div className=&quot;flex justify-between items-center mb-6&quot;>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Organizations</h1>
            <p className=&quot;text-muted-foreground&quot;>
              Manage all organizations in the system
            </p>
          </div>
          <Button onClick={() => router.push(&quot;/admin/organizations/create&quot;)}>
            Add Organization
          </Button>
        </div>

      <Separator className=&quot;my-6&quot; />

      <Tabs defaultValue=&quot;all&quot; className=&quot;space-y-4&quot;>
        <TabsList>
          <TabsTrigger value=&quot;all&quot;>All Organizations</TabsTrigger>
          <TabsTrigger value=&quot;internal&quot;>Internal</TabsTrigger>
          <TabsTrigger value=&quot;client&quot;>Client</TabsTrigger>
          <TabsTrigger value=&quot;partner&quot;>Partner</TabsTrigger>
        </TabsList>

        {[&quot;all&quot;, &quot;internal&quot;, &quot;client&quot;, &quot;partner&quot;].map((tab) => (
          <TabsContent key={tab} value={tab} className=&quot;space-y-4&quot;>
            <div className=&quot;grid gap-4 md:grid-cols-2 lg:grid-cols-3&quot;>
              {organizations
                .filter((org) => tab === &quot;all&quot; || org.type === tab)
                .map((organization) => (
                  <Card key={organization.id} className=&quot;overflow-hidden&quot;>
                    <CardHeader className=&quot;pb-2&quot;>
                      <div className=&quot;flex justify-between items-start&quot;>
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
                      <div className=&quot;grid grid-cols-2 gap-2 text-sm&quot;>
                        <div>
                          <p className=&quot;text-muted-foreground&quot;>Type</p>
                          <p className=&quot;font-medium&quot;>{organization.type}</p>
                        </div>
                        <div>
                          <p className=&quot;text-muted-foreground&quot;>Tier</p>
                          <p className=&quot;font-medium&quot;>
                            {organization.tier || &quot;N/A&quot;}
                          </p>
                        </div>
                        <div>
                          <p className=&quot;text-muted-foreground&quot;>Status</p>
                          <p className=&quot;font-medium&quot;>
                            {organization.status === &quot;active&quot; ? &quot;Active&quot; : &quot;Inactive&quot;}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className=&quot;border-t bg-muted/50 px-6 py-3&quot;>
                      <div className=&quot;flex items-center justify-between w-full&quot;>
                        <Link href={`/admin/organizations/${organization.id}`}>
                          <Button
                            variant=&quot;outline&quot;
                            size=&quot;sm&quot;
                            className=&quot;h-8 gap-1&quot;
                          >
                            <Building2 className=&quot;h-3.5 w-3.5&quot; />
                            <span>View</span>
                          </Button>
                        </Link>
                        <div className=&quot;flex gap-2&quot;>
                          <Link
                            href={`/admin/organizations/manage?organizationId=${organization.id}`}
                          >
                            <Button
                              variant=&quot;outline&quot;
                              size=&quot;sm&quot;
                              className=&quot;h-8 gap-1&quot;
                            >
                              <Settings className=&quot;h-3.5 w-3.5&quot; />
                              <span>Manage</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            {organizations.filter((org) => tab === &quot;all&quot; || org.type === tab)
              .length === 0 && (
              <div className=&quot;flex flex-col items-center justify-center p-8 text-center&quot;>
                <Building2 className=&quot;h-12 w-12 text-muted-foreground mb-4&quot; />
                <h3 className=&quot;text-lg font-medium&quot;>No organizations found</h3>
                <p className=&quot;text-muted-foreground mt-2&quot;>
                  {tab === &quot;all&quot;
                    ? &quot;There are no organizations in the system yet.&quot;
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
  let variant: &quot;default&quot; | &quot;outline&quot; | &quot;secondary&quot; | &quot;destructive&quot; = &quot;default&quot;;

  switch (type) {
    case &quot;internal&quot;:
      variant = &quot;default&quot;;
      break;
    case &quot;client&quot;:
      variant = &quot;secondary&quot;;
      break;
    case &quot;partner&quot;:
      variant = &quot;outline&quot;;
      break;
    default:
      variant = &quot;default&quot;;
  }

  return (
    <div className=&quot;flex gap-2&quot;>
      <Badge variant={variant}>{type}</Badge>
      {tier && <Badge variant=&quot;outline&quot;>{tier.replace(&quot;_&quot;, &quot; &quot;)}</Badge>}
    </div>
  );
}
