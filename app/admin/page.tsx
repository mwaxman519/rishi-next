&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { getAllFeatureModules } from &quot;@shared/features&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Users,
  Building2,
  PuzzleIcon,
  Globe,
  ClipboardList,
  Settings,
} from &quot;lucide-react&quot;;

interface TileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
}

function AdminTile({ title, description, icon, href, count }: TileProps) {
  return (
    <Link href={href}>
      <Card className=&quot;h-full hover:shadow-md transition-shadow cursor-pointer&quot;>
        <CardHeader className=&quot;pb-2&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <CardTitle className=&quot;text-lg&quot;>{title}</CardTitle>
            <div className=&quot;text-primary rounded-full p-2 bg-primary/10&quot;>
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className=&quot;text-sm&quot;>{description}</CardDescription>

          {count !== undefined && (
            <p className=&quot;mt-2 text-2xl font-bold&quot;>{count}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    organizations: 0,
    users: 0,
    regions: 0,
    features: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real implementation, we would fetch these counts from the API
    // For now, we&apos;re using mock data
    const fetchDashboardData = async () => {
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data for development
        setCounts({
          organizations: 5,
          users: 32,
          regions: 8,
          features: getAllFeatureModules().length,
        });
      } catch (error) {
        console.error(&quot;Error fetching dashboard data:&quot;, error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className=&quot;text-center py-8&quot;>Loading dashboard data...</div>;
  }

  return (
    <div>
      <h2 className=&quot;text-2xl font-bold mb-6&quot;>System Overview</h2>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8&quot;>
        <AdminTile
          title=&quot;Organizations&quot;
          description=&quot;Manage client organizations and their settings&quot;
          icon={<Building2 className=&quot;h-6 w-6&quot; />}
          href=&quot;/admin/organizations&quot;
          count={counts.organizations}
        />

        <AdminTile
          title=&quot;Users&quot;
          description=&quot;Manage user accounts and permissions&quot;
          icon={<Users className=&quot;h-6 w-6&quot; />}
          href=&quot;/admin/users&quot;
          count={counts.users}
        />

        <AdminTile
          title=&quot;Features&quot;
          description=&quot;Configure features available to each tier&quot;
          icon={<PuzzleIcon className=&quot;h-6 w-6&quot; />}
          href=&quot;/admin/features&quot;
          count={counts.features}
        />

        <AdminTile
          title=&quot;Regions&quot;
          description=&quot;Manage geographic regions and assignments&quot;
          icon={<Globe className=&quot;h-6 w-6&quot; />}
          href=&quot;/admin/regions&quot;
          count={counts.regions}
        />

        <AdminTile
          title=&quot;Audit Logs&quot;
          description=&quot;Review system activity and security events&quot;
          icon={<ClipboardList className=&quot;h-6 w-6&quot; />}
          href=&quot;/admin/audit-logs&quot;
        />

        <AdminTile
          title=&quot;System Settings&quot;
          description=&quot;Configure global system settings&quot;
          icon={<Settings className=&quot;h-6 w-6&quot; />}
          href=&quot;/admin/settings&quot;
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-2&quot;>
            <Button onClick={() => router.push(&quot;/admin/organizations/create&quot;)}>
              Add Organization
            </Button>
            <Button onClick={() => router.push(&quot;/users/new&quot;)}>
              Add User
            </Button>
            <Button onClick={() => router.push(&quot;/admin/features&quot;)}>
              Manage Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
