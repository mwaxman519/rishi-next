"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Building,
  Calendar,
  Package,
  MapPin,
  Users,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Shield,
  Database,
  Server,
  FileBarChart,
  Settings,
  Globe,
  BadgeAlert,
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Platform Dashboard
        </h1>
      </div>

      {/* Platform-wide Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Organizations</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              25
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/organizations"
              className="text-xs text-primary hover:underline"
            >
              Manage organizations →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              156
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/users"
              className="text-xs text-primary hover:underline"
            >
              Manage users →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Events</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              42
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/events"
              className="text-xs text-primary hover:underline"
            >
              Manage events →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Geographic Regions</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Globe className="mr-2 h-5 w-5 text-primary" />
              18
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/regions"
              className="text-xs text-primary hover:underline"
            >
              Manage regions →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts & Admin Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Alerts Card */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <BadgeAlert className="mr-2 h-5 w-5 text-red-500" />
                  Critical System Alerts
                </CardTitle>
                <span className="text-xs font-medium py-1 px-3 rounded-full bg-red-100 text-red-800">
                  2 Alerts
                </span>
              </div>
              <CardDescription>
                Alerts requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Database Performance</div>
                    <div className="text-sm text-muted-foreground">
                      Slow query performance detected • 15 minutes ago
                    </div>
                  </div>
                  <Link
                    href="/admin/alerts/1"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Investigate →
                  </Link>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">API Rate Limiting</div>
                    <div className="text-sm text-muted-foreground">
                      Rate limit threshold reached • 42 minutes ago
                    </div>
                  </div>
                  <Link
                    href="/admin/alerts/2"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Investigate →
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/admin/alerts"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all alerts →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Monitoring Card */}
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-amber-500" />
                  Security Monitoring
                </CardTitle>
                <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800">
                  12 Events
                </span>
              </div>
              <CardDescription>
                Recent security activity on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Failed Login Attempts</div>
                    <div className="text-sm text-muted-foreground">
                      5 attempts from IP 192.168.1.25 • 30 minutes ago
                    </div>
                  </div>
                  <Link
                    href="/admin/security/login-attempts"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Details →
                  </Link>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">Permission Escalation</div>
                    <div className="text-sm text-muted-foreground">
                      User role modified by super admin • 2 hours ago
                    </div>
                  </div>
                  <Link
                    href="/admin/security/permissions"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Details →
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/admin/security"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View security logs →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Performance */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <Database className="mr-2 h-5 w-5 text-primary" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Query Performance</span>
                  <span className="text-sm font-medium text-green-600">
                    92%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage Usage</span>
                  <span className="text-sm font-medium text-amber-600">
                    68%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: "68%" }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Link
                    href="/admin/system/database"
                    className="text-xs text-primary hover:underline"
                  >
                    Database dashboard →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <Server className="mr-2 h-5 w-5 text-primary" />
                Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm font-medium text-amber-600">
                    72%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium text-green-600">
                    45%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Link
                    href="/admin/system/server"
                    className="text-xs text-primary hover:underline"
                  >
                    Server dashboard →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <Globe className="mr-2 h-5 w-5 text-primary" />
                API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium text-green-600">
                    86%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "86%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "2%" }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Link
                    href="/admin/system/api"
                    className="text-xs text-primary hover:underline"
                  >
                    API dashboard →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Organization Management */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Organization Management</h2>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                Recent Organizations
              </CardTitle>
              <Link
                href="/admin/organizations/create"
                className="text-xs font-medium py-1 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add Organization
              </Link>
            </div>
            <CardDescription>
              Recently created or updated organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">Acme Corporation</div>
                  <div className="text-sm text-muted-foreground">
                    Client (Tier 3) • 12 users • 5 active events
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="/admin/organizations/edit/1"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/admin/organizations/view/1"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">Globex Industries</div>
                  <div className="text-sm text-muted-foreground">
                    Client (Tier 2) • 8 users • 3 active events
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="/admin/organizations/edit/2"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/admin/organizations/view/2"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Initech</div>
                  <div className="text-sm text-muted-foreground">
                    Client (Tier 1) • 4 users • 1 active event
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="/admin/organizations/edit/3"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link
                    href="/admin/organizations/view/3"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/admin/organizations"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all organizations →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/admin/settings/general"
                  className="block text-primary hover:underline"
                >
                  General Settings
                </Link>
                <Link
                  href="/admin/settings/security"
                  className="block text-primary hover:underline"
                >
                  Security Settings
                </Link>
                <Link
                  href="/admin/settings/notifications"
                  className="block text-primary hover:underline"
                >
                  Notification Settings
                </Link>
                <Link
                  href="/admin/settings/integrations"
                  className="block text-primary hover:underline"
                >
                  External Integrations
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                User & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/admin/rbac"
                  className="block text-primary hover:underline"
                >
                  RBAC Dashboard
                </Link>
                <Link
                  href="/admin/users/permissions"
                  className="block text-primary hover:underline"
                >
                  Manage User Permissions
                </Link>
                <Link
                  href="/admin/roles"
                  className="block text-primary hover:underline"
                >
                  Role Management
                </Link>
                <Link
                  href="/admin/audit"
                  className="block text-primary hover:underline"
                >
                  Audit Logs
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileBarChart className="mr-2 h-5 w-5 text-primary" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/admin/analytics/system"
                  className="block text-primary hover:underline"
                >
                  System Performance
                </Link>
                <Link
                  href="/admin/analytics/usage"
                  className="block text-primary hover:underline"
                >
                  Platform Usage
                </Link>
                <Link
                  href="/admin/analytics/trends"
                  className="block text-primary hover:underline"
                >
                  Usage Trends
                </Link>
                <Link
                  href="/admin/analytics/reports"
                  className="block text-primary hover:underline"
                >
                  Generate Reports
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
