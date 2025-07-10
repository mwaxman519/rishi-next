"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllFeatureModules } from "@shared/features";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  PuzzleIcon,
  Globe,
  ClipboardList,
  Settings,
} from "lucide-react";

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
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="text-primary rounded-full p-2 bg-primary/10">
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">{description}</CardDescription>

          {count !== undefined && (
            <p className="mt-2 text-2xl font-bold">{count}</p>
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
    // For now, we're using mock data
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
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard data...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AdminTile
          title="Organizations"
          description="Manage client organizations and their settings"
          icon={<Building2 className="h-6 w-6" />}
          href="/admin/organizations"
          count={counts.organizations}
        />

        <AdminTile
          title="Users"
          description="Manage user accounts and permissions"
          icon={<Users className="h-6 w-6" />}
          href="/admin/users"
          count={counts.users}
        />

        <AdminTile
          title="Features"
          description="Configure features available to each tier"
          icon={<PuzzleIcon className="h-6 w-6" />}
          href="/admin/features"
          count={counts.features}
        />

        <AdminTile
          title="Regions"
          description="Manage geographic regions and assignments"
          icon={<Globe className="h-6 w-6" />}
          href="/admin/regions"
          count={counts.regions}
        />

        <AdminTile
          title="Audit Logs"
          description="Review system activity and security events"
          icon={<ClipboardList className="h-6 w-6" />}
          href="/admin/audit-logs"
        />

        <AdminTile
          title="System Settings"
          description="Configure global system settings"
          icon={<Settings className="h-6 w-6" />}
          href="/admin/settings"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/admin/organizations/create")}>
              Add Organization
            </Button>
            <Button onClick={() => router.push("/admin/users/create")}>
              Add User
            </Button>
            <Button onClick={() => router.push("/admin/features")}>
              Manage Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
