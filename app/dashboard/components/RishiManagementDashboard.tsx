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
  Clock,
  BarChart3,
  FileBarChart,
  DollarSign,
  ClipboardList,
  Bell,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

export default function RishiManagementDashboard() {
  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
          Management Dashboard
        </h1>
      </div>

      {/* Core Stats Row */}
      <div className=&quot;grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Building className=&quot;mr-2 h-5 w-5 text-primary&quot; />
              12
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/client-management&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage clients →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Active Events</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Calendar className=&quot;mr-2 h-5 w-5 text-primary&quot; />8
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/events/active&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              View active events →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Staff Available</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <Users className=&quot;mr-2 h-5 w-5 text-primary&quot; />
              28
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/staff-management&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage staff →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;pb-2&quot;>
            <CardDescription>Active Regions</CardDescription>
            <CardTitle className=&quot;text-3xl flex items-center&quot;>
              <MapPin className=&quot;mr-2 h-5 w-5 text-primary&quot; />8
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href=&quot;/regions&quot;
              className=&quot;text-xs text-primary hover:underline&quot;
            >
              Manage regions →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Attention Required Section */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Attention Required</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          {/* Booking Requests Card */}
          <Card className=&quot;border-amber-200&quot;>
            <CardHeader className=&quot;pb-3&quot;>
              <div className=&quot;flex justify-between items-start&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <AlertTriangle className=&quot;mr-2 h-5 w-5 text-amber-500&quot; />
                  Pending Booking Requests
                </CardTitle>
                <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800&quot;>
                  5 Requests
                </span>
              </div>
              <CardDescription>
                Events awaiting management approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Product Launch</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Acme Corporation • May 15, 2025
                    </div>
                  </div>
                  <Link
                    href=&quot;/events/request/1&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Review →
                  </Link>
                </div>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Trade Show</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Globex Industries • June 5-7, 2025
                    </div>
                  </div>
                  <Link
                    href=&quot;/events/request/2&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Review →
                  </Link>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Corporate Training</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Initech • May 20-22, 2025
                    </div>
                  </div>
                  <Link
                    href=&quot;/events/request/3&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Review →
                  </Link>
                </div>
              </div>
              <div className=&quot;mt-4 flex justify-end&quot;>
                <Link
                  href=&quot;/events/booking-requests&quot;
                  className=&quot;text-sm font-medium text-primary hover:underline&quot;
                >
                  View all requests →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Staffing Needs Card */}
          <Card className=&quot;border-amber-200&quot;>
            <CardHeader className=&quot;pb-3&quot;>
              <div className=&quot;flex justify-between items-start&quot;>
                <CardTitle className=&quot;flex items-center&quot;>
                  <Users className=&quot;mr-2 h-5 w-5 text-amber-500&quot; />
                  Staffing Needs
                </CardTitle>
                <span className=&quot;text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800&quot;>
                  3 Events
                </span>
              </div>
              <CardDescription>
                Events requiring staff assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Tech Workshop</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Needs 3 more staff • April 25, 2025
                    </div>
                  </div>
                  <Link
                    href=&quot;/staff-management/assign/1&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Assign →
                  </Link>
                </div>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Product Launch</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Needs 5 more staff • May 10, 2025
                    </div>
                  </div>
                  <Link
                    href=&quot;/staff-management/assign/2&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Assign →
                  </Link>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <div>
                    <div className=&quot;font-medium&quot;>Trade Show</div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Needs 8 more staff • June 5-7, 2025
                    </div>
                  </div>
                  <Link
                    href=&quot;/staff-management/assign/3&quot;
                    className=&quot;text-xs font-medium text-primary hover:underline self-center&quot;
                  >
                    Assign →
                  </Link>
                </div>
              </div>
              <div className=&quot;mt-4 flex justify-end&quot;>
                <Link
                  href=&quot;/staff-management/needs&quot;
                  className=&quot;text-sm font-medium text-primary hover:underline&quot;
                >
                  View all staffing needs →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Operational Metrics</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          {/* Staff Utilization */}
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <Clock className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Staff Utilization
              </CardTitle>
              <CardDescription>
                Current staff deployment and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div className=&quot;font-medium&quot;>Currently Deployed</div>
                  <div className=&quot;font-medium&quot;>12 Staff (43%)</div>
                </div>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div className=&quot;font-medium&quot;>Available This Week</div>
                  <div className=&quot;font-medium&quot;>16 Staff (57%)</div>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <div className=&quot;font-medium&quot;>Scheduled Next Week</div>
                  <div className=&quot;font-medium&quot;>22 Staff (79%)</div>
                </div>
              </div>
              <div className=&quot;mt-4 flex justify-end&quot;>
                <Link
                  href=&quot;/analytics/staff-utilization&quot;
                  className=&quot;text-sm font-medium text-primary hover:underline&quot;
                >
                  View detailed metrics →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <DollarSign className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Financial Overview
              </CardTitle>
              <CardDescription>Current month financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div className=&quot;font-medium&quot;>Revenue (MTD)</div>
                  <div className=&quot;font-medium&quot;>$125,750</div>
                </div>
                <div className=&quot;flex justify-between border-b pb-2&quot;>
                  <div className=&quot;font-medium&quot;>Expenses (MTD)</div>
                  <div className=&quot;font-medium&quot;>$87,320</div>
                </div>
                <div className=&quot;flex justify-between&quot;>
                  <div className=&quot;font-medium&quot;>Projected Monthly</div>
                  <div className=&quot;font-medium&quot;>$210,500</div>
                </div>
              </div>
              <div className=&quot;mt-4 flex justify-end&quot;>
                <Link
                  href=&quot;/finance/overview&quot;
                  className=&quot;text-sm font-medium text-primary hover:underline&quot;
                >
                  View financial reports →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Management Tools */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Management Tools</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle className=&quot;flex items-center text-lg&quot;>
                <ClipboardList className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Client Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2 text-sm&quot;>
                <Link
                  href=&quot;/client-management/accounts&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Client Accounts
                </Link>
                <Link
                  href=&quot;/client-management/locations&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Manage Locations
                </Link>
                <Link
                  href=&quot;/client-management/kits&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Equipment Allocation
                </Link>
                <Link
                  href=&quot;/client-management/staff&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Staff Assignment
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle className=&quot;flex items-center text-lg&quot;>
                <FileBarChart className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2 text-sm&quot;>
                <Link
                  href=&quot;/analytics/performance&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Performance Metrics
                </Link>
                <Link
                  href=&quot;/analytics/client-satisfaction&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Client Satisfaction
                </Link>
                <Link
                  href=&quot;/analytics/staffing&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Staffing Analytics
                </Link>
                <Link
                  href=&quot;/analytics/financial&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Financial Reports
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle className=&quot;flex items-center text-lg&quot;>
                <Bell className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Alert Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2 text-sm&quot;>
                <Link
                  href=&quot;/alerts/low-inventory&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Low Inventory Alerts
                </Link>
                <Link
                  href=&quot;/alerts/staffing-shortages&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Staffing Shortages
                </Link>
                <Link
                  href=&quot;/alerts/deadline-alerts&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  Approaching Deadlines
                </Link>
                <Link
                  href=&quot;/alerts/system&quot;
                  className=&quot;block text-primary hover:underline&quot;
                >
                  System Notifications
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      <div>
        <h2 className=&quot;text-xl font-semibold mb-4&quot;>Performance Analytics</h2>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <BarChart3 className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Events by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;h-64 flex items-center justify-center&quot;>
                <div className=&quot;text-center&quot;>
                  <p className=&quot;text-muted-foreground&quot;>
                    Regional event distribution charts will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;flex items-center&quot;>
                <BarChart3 className=&quot;mr-2 h-5 w-5 text-primary&quot; />
                Resource Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;h-64 flex items-center justify-center&quot;>
                <div className=&quot;text-center&quot;>
                  <p className=&quot;text-muted-foreground&quot;>
                    Staff and kit utilization metrics will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
