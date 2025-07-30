&quot;use client&quot;;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
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
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function SuperAdminDashboard() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
          Platform Dashboard
        </h1>
      </div>

      {/* Platform-wide Stats Row */}
      <div className=&quot;grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Organizations</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Building className=&quot;mr-2 h-5 w-5 text-primary&quot; />
              25
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/admin/organizations&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage organizations →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Total Users</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Users className=&quot;mr-2 h-5 w-5 text-primary&quot; />
              156
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/admin/users&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage users →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Active Events</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Calendar className=&quot;mr-2 h-5 w-5 text-primary&quot; />
              42
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/admin/events&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage events →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Geographic Regions</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Globe className=&quot;mr-2 h-5 w-5 text-primary&quot; />
              18
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/admin/regions&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage regions →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts & Admin Actions */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>System Alerts</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          {/* System Alerts Card */}
          <Card className=&quot;border-red-200&quot;>
            <CardHeader className=&quot;pb-3&quot;>
              <div className=&quot;flex justify-between items-start&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <BadgeAlert className=&quot;mr-2 h-5 w-5 text-red-500&quot; />
                  Critical System Alerts
                </CardTitle>
                <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-red-100 text-red-800&quot;>
                  2 Alerts
                </span>
              </div>
              <CardDescription>
                Alerts requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Database Performance</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Slow query performance detected • 15 minutes ago
                    </div>
                  </div>
                  <Link
                    href=&quot;/admin/alerts/1&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Investigate →
                  </Link>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>API Rate Limiting</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Rate limit threshold reached • 42 minutes ago
                    </div>
                  </div>
                  <Link
                    href=&quot;/admin/alerts/2&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Investigate →
                  </Link>
                </div>
              </div>
              <div className=&quot;mt-4 flex justify-end&quot;>
                <Link
                  href=&quot;/admin/alerts&quot;
                  className=&quot;text-sm font-medium text-primary hover:underline&quot;
                >
                  View all alerts →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Monitoring Card */}
          <Card className=&quot;border-amber-200&quot;>
            <CardHeader className=&quot;pb-3&quot;>
              <div className=&quot;flex justify-between items-start&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Shield className=&quot;mr-2 h-5 w-5 text-amber-500&quot; />
                  Security Monitoring
                </CardTitle>
                <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800&quot;>
                  12 Events
                </span>
              </div>
              <CardDescription>
                Recent security activity on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Failed Login Attempts</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      5 attempts from IP 192.168.1.25 • 30 minutes ago
                    </div>
                  </div>
                  <Link
                    href=&quot;/admin/security/login-attempts&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Details →
                  </Link>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Permission Escalation</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      User role modified by super admin • 2 hours ago
                    </div>
                  </div>
                  <Link
                    href=&quot;/admin/security/permissions&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Details →
                  </Link>
                </div>
              </div>
              <div className=&quot;mt-4 flex justify-end&quot;>
                <Link
                  href=&quot;/admin/security&quot;
                  className=&quot;text-sm font-medium text-primary hover:underline&quot;
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
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>System Performance</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center text-base&quot;>
                <Database className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm&quot;>Query Performance</span>
                  <span className=&quot;text-sm font-medium text-green-600&quot;>
                    92%
                  </span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-green-600 h-2 rounded-full&quot;
                    style={{ width: &quot;92%&quot; }}
                  ></div>
                </div>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm&quot;>Storage Usage</span>
                  <span className=&quot;text-sm font-medium text-amber-600&quot;>
                    68%
                  </span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-amber-600 h-2 rounded-full&quot;
                    style={{ width: &quot;68%&quot; }}
                  ></div>
                </div>
                <div className=&quot;mt-2&quot;>
                  <Link
                    href=&quot;/admin/system/database&quot;
                    className=&quot;text-xs text-primary hover:underline&quot;
                  >
                    Database dashboard →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center text-base&quot;>
                <Server className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm&quot;>CPU Usage</span>
                  <span className=&quot;text-sm font-medium text-amber-600&quot;>
                    72%
                  </span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-amber-600 h-2 rounded-full&quot;
                    style={{ width: &quot;72%&quot; }}
                  ></div>
                </div>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm&quot;>Memory Usage</span>
                  <span className=&quot;text-sm font-medium text-green-600&quot;>
                    45%
                  </span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-green-600 h-2 rounded-full&quot;
                    style={{ width: &quot;45%&quot; }}
                  ></div>
                </div>
                <div className=&quot;mt-2&quot;>
                  <Link
                    href=&quot;/admin/system/server&quot;
                    className=&quot;text-xs text-primary hover:underline&quot;
                  >
                    Server dashboard →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center text-base&quot;>
                <Globe className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2&quot;>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm&quot;>Response Time</span>
                  <span className=&quot;text-sm font-medium text-green-600&quot;>
                    86%
                  </span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-green-600 h-2 rounded-full&quot;
                    style={{ width: &quot;86%&quot; }}
                  ></div>
                </div>
                <div className=&quot;flex justify-between items-center&quot;>
                  <span className=&quot;text-sm&quot;>Error Rate</span>
                  <span className=&quot;text-sm font-medium text-green-600&quot;>2%</span>
                </div>
                <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                  <div
                    className=&quot;bg-green-600 h-2 rounded-full&quot;
                    style={{ width: &quot;2%&quot; }}
                  ></div>
                </div>
                <div className=&quot;mt-2&quot;>
                  <Link
                    href=&quot;/admin/system/api&quot;
                    className=&quot;text-xs text-primary hover:underline&quot;
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
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Organization Management</h2>
        <Card>
          <CardHeader className=&quot;pb-3&quot;>
            <div className=&quot;flex justify-between items-start&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <Building className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Recent Organizations
              </CardTitle>
              <Link
                href=&quot;/admin/organizations/create&quot;
                className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90&quot;
              >
                Add Organization
              </Link>
            </div>
            <CardDescription>
              Recently created or updated organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-3&quot;>
              <div className=&quot;flex justify-between items-center border-b pb-2&quot;>
                <div>
                  <div className=&quot;font-medium&quot;>Acme Corporation</div>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Client (Tier 3) • 12 users • 5 active events
                  </div>
                </div>
                <div className=&quot;flex space-x-2&quot;>
                  <Link
                    href=&quot;/admin/organizations/edit/1&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline&quot;
                  >
                    Edit
                  </Link>
                  <span className=&quot;text-muted-foreground&quot;>|</span>
                  <Link
                    href=&quot;/admin/organizations/view/1&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline&quot;
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className=&quot;flex justify-between items-center border-b pb-2&quot;>
                <div>
                  <div className=&quot;font-medium&quot;>Globex Industries</div>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Client (Tier 2) • 8 users • 3 active events
                  </div>
                </div>
                <div className=&quot;flex space-x-2&quot;>
                  <Link
                    href=&quot;/admin/organizations/edit/2&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline&quot;
                  >
                    Edit
                  </Link>
                  <span className=&quot;text-muted-foreground&quot;>|</span>
                  <Link
                    href=&quot;/admin/organizations/view/2&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline&quot;
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className=&quot;flex justify-between items-center&quot;>
                <div>
                  <div className=&quot;font-medium&quot;>Initech</div>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Client (Tier 1) • 4 users • 1 active event
                  </div>
                </div>
                <div className=&quot;flex space-x-2&quot;>
                  <Link
                    href=&quot;/admin/organizations/edit/3&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline&quot;
                  >
                    Edit
                  </Link>
                  <span className=&quot;text-muted-foreground&quot;>|</span>
                  <Link
                    href=&quot;/admin/organizations/view/3&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline&quot;
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
            <div className=&quot;mt-4 flex justify-end&quot;>
              <Link
                href=&quot;/admin/organizations&quot;
                className=&quot;text-sm font-medium text-primary hover:underline&quot;
              >
                View all organizations →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Admin Tools</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle className=&quot;flex items-center text-lg&quot;>
                <Settings className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2 text-sm&quot;>
                <Link
                  href=&quot;/admin/settings/general&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  General Settings
                </Link>
                <Link
                  href=&quot;/admin/settings/security&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Security Settings
                </Link>
                <Link
                  href=&quot;/admin/settings/notifications&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Notification Settings
                </Link>
                <Link
                  href=&quot;/admin/settings/integrations&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  External Integrations
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle className=&quot;flex items-center text-lg&quot;>
                <Shield className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                User & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2 text-sm&quot;>
                <Link
                  href=&quot;/admin/rbac&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  RBAC Dashboard
                </Link>
                <Link
                  href=&quot;/admin/users/permissions&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Manage User Permissions
                </Link>
                <Link
                  href=&quot;/admin/roles&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Role Management
                </Link>
                <Link
                  href=&quot;/admin/audit&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Audit Logs
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle className=&quot;flex items-center text-lg&quot;>
                <FileBarChart className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2 text-sm&quot;>
                <Link
                  href=&quot;/admin/analytics/system&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  System Performance
                </Link>
                <Link
                  href=&quot;/admin/analytics/usage&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Platform Usage
                </Link>
                <Link
                  href=&quot;/admin/analytics/trends&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Usage Trends
                </Link>
                <Link
                  href=&quot;/admin/analytics/reports&quot;
                  className=&quot;block text-primary hover:underline&quot;
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
