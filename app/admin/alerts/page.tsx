&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { format } from &quot;date-fns&quot;;
import {
  BadgeAlert,
  AlertTriangle,
  Info,
  Filter,
  Calendar,
  Search,
  MoreHorizontal,
  Check,
  Eye,
  Clock,
  ChevronRight,
  ChevronLeft,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;

// Mock data
const alerts = [
  {
    id: 1,
    title: &quot;Database Performance&quot;,
    description: &quot;Slow query performance detected in production environment&quot;,
    status: &quot;critical&quot;,
    category: &quot;system&quot;,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
  {
    id: 2,
    title: &quot;API Rate Limiting&quot;,
    description: &quot;Rate limit threshold reached for external API calls&quot;,
    status: &quot;critical&quot;,
    category: &quot;api&quot;,
    createdAt: new Date(Date.now() - 42 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
  {
    id: 3,
    title: &quot;User Authentication Spike&quot;,
    description: &quot;Unusual number of authentication failures detected&quot;,
    status: &quot;warning&quot;,
    category: &quot;security&quot;,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    resolvedAt: null,
    assignedTo: &quot;Alex Johnson&quot;,
  },
  {
    id: 4,
    title: &quot;Memory Usage High&quot;,
    description: &quot;Server memory usage exceeded 85% threshold&quot;,
    status: &quot;warning&quot;,
    category: &quot;system&quot;,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
  {
    id: 5,
    title: &quot;Scheduled Maintenance&quot;,
    description: &quot;System will be undergoing maintenance in 24 hours&quot;,
    status: &quot;info&quot;,
    category: &quot;maintenance&quot;,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case &quot;critical&quot;:
      return (
        <Badge variant=&quot;destructive&quot; className=&quot;rounded-sm px-2 py-1&quot;>
          Critical
        </Badge>
      );
    case &quot;warning&quot;:
      return (
        <Badge
          variant=&quot;outline&quot;
          className=&quot;bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 rounded-sm px-2 py-1&quot;
        >
          Warning
        </Badge>
      );
    case &quot;info&quot;:
      return (
        <Badge
          variant=&quot;outline&quot;
          className=&quot;bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 rounded-sm px-2 py-1&quot;
        >
          Info
        </Badge>
      );
    default:
      return (
        <Badge variant=&quot;outline&quot; className=&quot;rounded-sm px-2 py-1&quot;>
          {status}
        </Badge>
      );
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case &quot;critical&quot;:
      return <BadgeAlert className=&quot;h-5 w-5 text-red-500&quot; />;
    case &quot;warning&quot;:
      return <AlertTriangle className=&quot;h-5 w-5 text-amber-500&quot; />;
    case &quot;info&quot;:
      return <Info className=&quot;h-5 w-5 text-blue-500&quot; />;
    default:
      return <Info className=&quot;h-5 w-5&quot; />;
  }
};

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [categoryFilter, setCategoryFilter] = useState(&quot;all&quot;);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters
  const filteredAlerts = alerts.filter((alert) => {
    // Search filter
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === &quot;all&quot; || alert.status === statusFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === &quot;all&quot; || alert.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <header className=&quot;mb-6&quot;>
        <div className=&quot;flex justify-between items-center&quot;>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>System Alerts</h1>
            <p className=&quot;text-muted-foreground mt-1&quot;>
              Monitor and manage system alerts across the platform
            </p>
          </div>
          <div className=&quot;flex items-center gap-2&quot;>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <Filter className=&quot;h-4 w-4 mr-2&quot; />
              Manage Filters
            </Button>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <Calendar className=&quot;h-4 w-4 mr-2&quot; />
              History
            </Button>
            <Button>
              <Check className=&quot;h-4 w-4 mr-2&quot; />
              Mark All as Read
            </Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue=&quot;active&quot; className=&quot;space-y-4&quot;>
        <TabsList>
          <TabsTrigger value=&quot;active&quot;>Active Alerts</TabsTrigger>
          <TabsTrigger value=&quot;resolved&quot;>Resolved</TabsTrigger>
          <TabsTrigger value=&quot;all&quot;>All Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;active&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle>Filter Alerts</CardTitle>
            </CardHeader>
            <CardContent className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
              <div>
                <Input
                  placeholder=&quot;Search alerts...&quot;
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=&quot;w-full&quot;
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className=&quot;w-full&quot;>
                    <SelectValue placeholder=&quot;Filter by status&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Statuses</SelectItem>
                    <SelectItem value=&quot;critical&quot;>Critical</SelectItem>
                    <SelectItem value=&quot;warning&quot;>Warning</SelectItem>
                    <SelectItem value=&quot;info&quot;>Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className=&quot;w-full&quot;>
                    <SelectValue placeholder=&quot;Filter by category&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&quot;all&quot;>All Categories</SelectItem>
                    <SelectItem value=&quot;system&quot;>System</SelectItem>
                    <SelectItem value=&quot;api&quot;>API</SelectItem>
                    <SelectItem value=&quot;security&quot;>Security</SelectItem>
                    <SelectItem value=&quot;maintenance&quot;>Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=&quot;flex justify-end&quot;>
                <Button
                  variant=&quot;outline&quot;
                  size=&quot;sm&quot;
                  onClick={() => {
                    setSearchQuery(&quot;&quot;);
                    setStatusFilter(&quot;all&quot;);
                    setCategoryFilter(&quot;all&quot;);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=&quot;pt-6&quot;>
              <div className=&quot;rounded-md border&quot;>
                <div className=&quot;relative w-full overflow-auto&quot;>
                  <table className=&quot;w-full caption-bottom text-sm&quot;>
                    <thead>
                      <tr className=&quot;border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted&quot;>
                        <th className=&quot;h-12 px-4 text-left align-middle font-medium&quot;>
                          Status
                        </th>
                        <th className=&quot;h-12 px-4 text-left align-middle font-medium&quot;>
                          Alert
                        </th>
                        <th className=&quot;h-12 px-4 text-left align-middle font-medium&quot;>
                          Time
                        </th>
                        <th className=&quot;h-12 px-4 text-left align-middle font-medium&quot;>
                          Category
                        </th>
                        <th className=&quot;h-12 px-4 text-left align-middle font-medium&quot;>
                          Assigned To
                        </th>
                        <th className=&quot;h-12 px-4 text-right align-middle font-medium&quot;>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAlerts.map((alert) => (
                        <tr
                          key={alert.id}
                          className=&quot;border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted&quot;
                        >
                          <td className=&quot;p-4 align-middle&quot;>
                            <div className=&quot;flex items-center&quot;>
                              {getStatusIcon(alert.status)}
                              <span className=&quot;ml-2&quot;>
                                {getStatusBadge(alert.status)}
                              </span>
                            </div>
                          </td>
                          <td className=&quot;p-4 align-middle&quot;>
                            <div>
                              <div className=&quot;font-medium&quot;>{alert.title}</div>
                              <div className=&quot;text-sm text-muted-foreground&quot;>
                                {alert.description}
                              </div>
                            </div>
                          </td>
                          <td className=&quot;p-4 align-middle&quot;>
                            <div className=&quot;flex items-center&quot;>
                              <Clock className=&quot;h-4 w-4 mr-2 text-gray-400&quot; />
                              {format(alert.createdAt, &quot;MMM d, h:mm a&quot;)}
                            </div>
                          </td>
                          <td className=&quot;p-4 align-middle&quot;>
                            <Badge variant=&quot;outline&quot; className=&quot;capitalize&quot;>
                              {alert.category}
                            </Badge>
                          </td>
                          <td className=&quot;p-4 align-middle&quot;>
                            {alert.assignedTo || &quot;-&quot;}
                          </td>
                          <td className=&quot;p-4 align-middle text-right&quot;>
                            <div className=&quot;flex justify-end gap-2&quot;>
                              <Button asChild variant=&quot;ghost&quot; size=&quot;icon&quot;>
                                <Link href={`/admin/alerts/${alert.id}`}>
                                  <Eye className=&quot;h-4 w-4&quot; />
                                  <span className=&quot;sr-only&quot;>View</span>
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                                    <MoreHorizontal className=&quot;h-4 w-4&quot; />
                                    <span className=&quot;sr-only&quot;>
                                      More options
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align=&quot;end&quot;>
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    Assign Alert
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Mark as Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    Silence Alert
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredAlerts.length === 0 && (
                <div className=&quot;flex flex-col items-center justify-center text-center p-8&quot;>
                  <BadgeAlert className=&quot;h-10 w-10 text-muted-foreground mb-4&quot; />
                  <h3 className=&quot;text-lg font-medium&quot;>No alerts found</h3>
                  <p className=&quot;text-muted-foreground mt-2&quot;>
                    No alerts match your current filter criteria. Try adjusting
                    your filters.
                  </p>
                </div>
              )}

              {filteredAlerts.length > 0 && (
                <div className=&quot;flex items-center justify-between mt-4&quot;>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Showing{&quot; &quot;}
                    {Math.min(
                      filteredAlerts.length,
                      (currentPage - 1) * itemsPerPage + 1,
                    )}{&quot; &quot;}
                    to{&quot; &quot;}
                    {Math.min(
                      filteredAlerts.length,
                      currentPage * itemsPerPage,
                    )}{&quot; &quot;}
                    of {filteredAlerts.length} alerts
                  </div>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Button
                      variant=&quot;outline&quot;
                      size=&quot;sm&quot;
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className=&quot;h-4 w-4&quot; />
                      <span className=&quot;sr-only&quot;>Previous page</span>
                    </Button>
                    <Button
                      variant=&quot;outline&quot;
                      size=&quot;sm&quot;
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className=&quot;h-4 w-4&quot; />
                      <span className=&quot;sr-only&quot;>Next page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;resolved&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardContent className=&quot;pt-6&quot;>
              <div className=&quot;flex flex-col items-center justify-center text-center p-8&quot;>
                <Check className=&quot;h-10 w-10 text-green-500 mb-4&quot; />
                <h3 className=&quot;text-lg font-medium&quot;>All caught up!</h3>
                <p className=&quot;text-muted-foreground mt-2&quot;>
                  There are no recently resolved alerts. Check back later or
                  view history.
                </p>
                <Button variant=&quot;outline&quot; className=&quot;mt-4&quot;>
                  <Calendar className=&quot;h-4 w-4 mr-2&quot; />
                  View Alert History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;all&quot; className=&quot;space-y-4&quot;>
          {/* Same content as &quot;active&quot; tab, but showing all alerts */}
          <Card>
            <CardHeader className=&quot;pb-3&quot;>
              <CardTitle>All System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className=&quot;text-center text-muted-foreground p-4">
                View and manage all alerts across the system, including resolved
                and acknowledged alerts.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
