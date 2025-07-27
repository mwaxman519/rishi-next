"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const alerts = [
  {
    id: 1,
    title: "Database Performance",
    description: "Slow query performance detected in production environment",
    status: "critical",
    category: "system",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
  {
    id: 2,
    title: "API Rate Limiting",
    description: "Rate limit threshold reached for external API calls",
    status: "critical",
    category: "api",
    createdAt: new Date(Date.now() - 42 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
  {
    id: 3,
    title: "User Authentication Spike",
    description: "Unusual number of authentication failures detected",
    status: "warning",
    category: "security",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    resolvedAt: null,
    assignedTo: "Alex Johnson",
  },
  {
    id: 4,
    title: "Memory Usage High",
    description: "Server memory usage exceeded 85% threshold",
    status: "warning",
    category: "system",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
  {
    id: 5,
    title: "Scheduled Maintenance",
    description: "System will be undergoing maintenance in 24 hours",
    status: "info",
    category: "maintenance",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "critical":
      return (
        <Badge variant="destructive" className="rounded-sm px-2 py-1">
          Critical
        </Badge>
      );
    case "warning":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 rounded-sm px-2 py-1"
        >
          Warning
        </Badge>
      );
    case "info":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 rounded-sm px-2 py-1"
        >
          Info
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="rounded-sm px-2 py-1">
          {status}
        </Badge>
      );
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "critical":
      return <BadgeAlert className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
      statusFilter === "all" || alert.status === statusFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || alert.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage system alerts across the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Manage Filters
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button>
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filter Alerts</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Alert
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Time
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Category
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Assigned To
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAlerts.map((alert) => (
                        <tr
                          key={alert.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              {getStatusIcon(alert.status)}
                              <span className="ml-2">
                                {getStatusBadge(alert.status)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div>
                              <div className="font-medium">{alert.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {alert.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {format(alert.createdAt, "MMM d, h:mm a")}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline" className="capitalize">
                              {alert.category}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            {alert.assignedTo || "-"}
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Button asChild variant="ghost" size="icon">
                                <Link href={`/admin/alerts/${alert.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">
                                      More options
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
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
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <BadgeAlert className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No alerts found</h3>
                  <p className="text-muted-foreground mt-2">
                    No alerts match your current filter criteria. Try adjusting
                    your filters.
                  </p>
                </div>
              )}

              {filteredAlerts.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min(
                      filteredAlerts.length,
                      (currentPage - 1) * itemsPerPage + 1,
                    )}{" "}
                    to{" "}
                    {Math.min(
                      filteredAlerts.length,
                      currentPage * itemsPerPage,
                    )}{" "}
                    of {filteredAlerts.length} alerts
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Check className="h-10 w-10 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground mt-2">
                  There are no recently resolved alerts. Check back later or
                  view history.
                </p>
                <Button variant="outline" className="mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Alert History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {/* Same content as "active" tab, but showing all alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground p-4">
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
