&quot;use client&quot;;

import { useEffect, useState, use } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  Shield,
  Users,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import Link from &quot;next/link&quot;;
import type { Organization } from &quot;@shared/schema&quot;;

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // Get organization details
  const { data: orgData, isLoading } = useQuery<Organization>({
    queryKey: [`/api/organizations/${id}`],
    enabled: !!id,
  });

  // If organization not found or loading
  if (isLoading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
      </div>
    );
  }

  const organization: Organization | undefined = orgData;

  if (!organization) {
    return (
      <div className=&quot;container mx-auto py-6&quot;>
        <div className=&quot;flex justify-between items-center mb-6&quot;>
          <Button
            variant=&quot;ghost&quot;
            onClick={() => router.push(&quot;/admin/organizations&quot;)}
            className=&quot;flex items-center&quot;
          >
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
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
            <Button onClick={() => router.push(&quot;/admin/organizations&quot;)}>
              Back to Organizations
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const tierName = organization?.tier
    ? organization?.tier
        .replace(&quot;_&quot;, &quot; &quot;)
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : &quot;No Tier&quot;;

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex justify-between items-center mb-6&quot;>
        <div className=&quot;flex items-center&quot;>
          <Button
            variant=&quot;ghost&quot;
            onClick={() => router.push(&quot;/admin/organizations&quot;)}
            className=&quot;mr-4&quot;
          >
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
            Back
          </Button>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
              {organization?.name || 'Unknown Organization'}
            </h1>
            <div className=&quot;flex items-center mt-1&quot;>
              <Badge variant=&quot;outline&quot; className=&quot;mr-2&quot;>
                {organization?.type?.charAt(0).toUpperCase() +
                  organization?.type?.slice(1) || 'Unknown'}
              </Badge>
              {organization?.tier && (
                <Badge variant=&quot;secondary&quot;>{tierName}</Badge>
              )}
              <Badge
                variant={organization?.status === &quot;active&quot; ? &quot;success&quot; : &quot;destructive&quot;}
                className=&quot;ml-2&quot;
              >
                {organization?.status === &quot;active&quot; ? &quot;Active&quot; : &quot;Inactive&quot;}
              </Badge>
            </div>
          </div>
        </div>
        <div className=&quot;flex space-x-2&quot;>
          <Link
            href={`/admin/organizations/settings?organizationId=${organization?.id}`}
          >
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              Manage Settings
            </Button>
          </Link>
          <Link
            href={`/admin/organizations/branding?organizationId=${organization?.id}`}
          >
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              Customize Branding
            </Button>
          </Link>
        </div>
      </div>

      <Separator className=&quot;my-6&quot; />

      <div className=&quot;grid gap-6 md:grid-cols-2&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Building2 className=&quot;mr-2 h-5 w-5&quot; />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className=&quot;space-y-4&quot;>
              <div>
                <dt className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  ID
                </dt>
                <dd className=&quot;text-sm mt-1&quot;>{organization?.id}</dd>
              </div>
              <div>
                <dt className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Type
                </dt>
                <dd className=&quot;text-sm mt-1 capitalize&quot;>{organization?.type}</dd>
              </div>
              <div>
                <dt className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Tier
                </dt>
                <dd className=&quot;text-sm mt-1&quot;>{tierName}</dd>
              </div>
              <div>
                <dt className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Status
                </dt>
                <dd className=&quot;text-sm mt-1&quot;>
                  {organization?.status === &quot;active&quot; ? &quot;Active&quot; : &quot;Inactive&quot;}
                </dd>
              </div>
              <div>
                <dt className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Created
                </dt>
                <dd className=&quot;text-sm mt-1&quot;>
                  {organization?.created_at ? new Date(organization?.created_at).toLocaleString() : 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Last Updated
                </dt>
                <dd className=&quot;text-sm mt-1&quot;>
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
          <CardContent className=&quot;grid gap-4&quot;>
            <Link
              href={`/admin/organizations/users?organizationId=${organization?.id}`}
            >
              <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                <Users className=&quot;mr-2 h-4 w-4&quot; />
                Manage Users
              </Button>
            </Link>
            <Link
              href={`/admin/organizations/roles?organizationId=${organization?.id}`}
            >
              <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                <Shield className=&quot;mr-2 h-4 w-4&quot; />
                Manage Roles & Permissions
              </Button>
            </Link>
            <Link
              href={`/admin/organizations/settings?organizationId=${organization?.id}`}
            >
              <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                <FileText className=&quot;mr-2 h-4 w-4&quot; />
                Organization Settings
              </Button>
            </Link>
            <Link
              href={`/admin/organizations/branding?organizationId=${organization?.id}`}
            >
              <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                <Building2 className=&quot;mr-2 h-4 w-4&quot; />
                Branding & Customization
              </Button>
            </Link>
            <Link
              href={`/admin/organization-regions?organizationId=${organization?.id}`}
            >
              <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                <MapPin className=&quot;mr-2 h-4 w-4&quot; />
                Manage Regions
              </Button>
            </Link>
            <Link
              href={`/admin/organization-events?organizationId=${organization?.id}`}
            >
              <Button variant=&quot;outline&quot; className=&quot;w-full justify-start&quot;>
                <Calendar className=&quot;mr-2 h-4 w-4&quot; />
                View Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
