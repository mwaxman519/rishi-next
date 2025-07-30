&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from &quot;@/components/ui/breadcrumb&quot;;
import { Card } from &quot;@/components/ui/card&quot;;
import { PendingLocationsList } from &quot;@/components/locations/PendingLocationsList&quot;;
import { ArrowLeft, ClipboardCheck, Map } from &quot;lucide-react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

export default function LocationApprovalQueuePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Check if user has admin permissions
  const { data: hasPermission, error: permissionError } = useQuery<boolean>({
    queryKey: [&quot;/api/permissions/check&quot;, &quot;update:locations&quot;],
    queryFn: async () => {
      const res = await fetch(
        &quot;/api/permissions/check?permission=update:locations&quot;,
      );
      if (!res.ok) {
        throw new Error(&quot;Failed to check permissions&quot;);
      }
      const data = await res.json();
      return data.hasPermission;
    },
  });

  // Redirect if user doesn&apos;t have admin permissions
  useEffect(() => {
    if (permissionError) {
      toast({
        title: &quot;Access Denied&quot;,
        description: &quot;You do not have permission to access this page.&quot;,
        variant: &quot;destructive&quot;,
      });
      router.push(&quot;/dashboard&quot;);
    }

    if (hasPermission === false) {
      toast({
        title: &quot;Access Denied&quot;,
        description:
          &quot;You do not have permission to access the location approval queue.&quot;,
        variant: &quot;destructive&quot;,
      });
      router.push(&quot;/dashboard&quot;);
    }
  }, [hasPermission, permissionError, router, toast]);

  return (
    <div className=&quot;container mx-auto p-6 max-w-7xl&quot;>
      {/* Breadcrumbs navigation */}
      <Breadcrumb className=&quot;mb-6&quot;>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href=&quot;/admin&quot;>Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href=&quot;/admin/locations&quot;>
              <Map className=&quot;h-3.5 w-3.5 inline-block mr-1&quot; />
              Locations
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className=&quot;font-semibold&quot;>
              <ClipboardCheck className=&quot;h-3.5 w-3.5 inline-block mr-1&quot; />
              Approval Queue
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header */}
      <div className=&quot;mb-8&quot;>
        <div className=&quot;flex items-center space-x-2 mb-2&quot;>
          <button
            onClick={() => router.back()}
            className=&quot;text-muted-foreground hover:text-foreground transition-colors&quot;
            aria-label=&quot;Go back&quot;
          >
            <ArrowLeft className=&quot;h-5 w-5&quot; />
          </button>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Location Approval Queue
          </h1>
        </div>
        <p className=&quot;text-muted-foreground&quot;>
          Review and manage locations that require administrator approval before
          being published
        </p>
      </div>

      {/* Main content */}
      <Card className=&quot;p-6&quot;>
        <PendingLocationsList />
      </Card>
    </div>
  );
}
