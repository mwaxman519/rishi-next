&quot;use client&quot;;

import React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { Shield, Settings, Users, Building2 } from &quot;lucide-react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;

export default function AccessControlPage() {
  return (
    <div className=&quot;container mx-auto p-6 max-w-6xl&quot;>
      <div className=&quot;flex items-center space-x-2 mb-6&quot;>
        <Shield className=&quot;h-6 w-6 text-primary&quot; />
        <h1 className=&quot;text-2xl font-bold&quot;>Access Control</h1>
      </div>

      <p className=&quot;text-muted-foreground mb-8&quot;>
        Manage role-based access control settings across the platform. Configure
        system-wide defaults and organization-specific permissions.
      </p>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        {/* System Defaults */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader>
            <CardTitle className=&quot;flex items-center space-x-2&quot;>
              <Settings className=&quot;h-5 w-5 text-primary&quot; />
              <span>System Defaults</span>
            </CardTitle>
            <CardDescription>
              Configure platform-wide default permissions and role settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/admin/rbac-defaults&quot;
              className=&quot;inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full&quot;
            >
              Manage System Defaults
            </Link>
          </CardContent>
        </Card>

        {/* Organization Settings */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader>
            <CardTitle className=&quot;flex items-center space-x-2&quot;>
              <Building2 className=&quot;h-5 w-5 text-primary&quot; />
              <span>Organization Settings</span>
            </CardTitle>
            <CardDescription>
              Configure organization-specific RBAC overrides and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/settings/rbac&quot;
              className=&quot;inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full&quot;
            >
              Manage Org Settings
            </Link>
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card className=&quot;hover:shadow-lg transition-shadow&quot;>
          <CardHeader>
            <CardTitle className=&quot;flex items-center space-x-2&quot;>
              <Users className=&quot;h-5 w-5 text-primary&quot; />
              <span>Permission Matrix</span>
            </CardTitle>
            <CardDescription>
              Visual overview of all roles and their permissions across the
              platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/admin/rbac&quot;
              className=&quot;inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full&quot;
            >
              View Permission Matrix
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className=&quot;mt-12&quot;>
        <h2 className=&quot;text-lg font-semibold mb-4&quot;>Quick Actions</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;text-base&quot;>Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
                View recent permission changes and role modifications
              </p>
              <Link
                href=&quot;/admin/monitoring/audit&quot;
                className=&quot;text-primary hover:underline text-sm&quot;
              >
                View Audit Logs →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className=&quot;text-base&quot;>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className=&quot;text-sm text-muted-foreground mb-4&quot;>
                Manage users and assign roles across organizations
              </p>
              <Link
                href=&quot;/admin/users&quot;
                className=&quot;text-primary hover:underline text-sm&quot;
              >
                Manage Users →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
