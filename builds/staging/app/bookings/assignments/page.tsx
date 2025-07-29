"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import { UserCheck, Calendar, MapPin, Clock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// Mock assignment data
const mockAssignments = [
  {
    id: 1,
    bookingId: "BK-001",
    eventName: "Product Demo - Best Buy",
    location: "Best Buy Downtown SF",
    date: "2025-01-15",
    time: "10:00 AM - 6:00 PM",
    staffAssigned: [
      { name: "Sarah Johnson", role: "Lead Ambassador", status: "confirmed" },
      { name: "Mike Chen", role: "Support Staff", status: "confirmed" }
    ],
    status: "fully_assigned",
    priority: "high",
    client: "Tech Corp"
  },
  {
    id: 2,
    bookingId: "BK-002",
    eventName: "Brand Activation - Whole Foods",
    location: "Whole Foods Mission Bay",
    date: "2025-01-17",
    time: "9:00 AM - 5:00 PM",
    staffAssigned: [
      { name: "Jessica Smith", role: "Brand Ambassador", status: "confirmed" }
    ],
    status: "needs_staff",
    priority: "medium",
    client: "Wellness Brand"
  },
  {
    id: 3,
    bookingId: "BK-003",
    eventName: "Trade Show Setup",
    location: "Moscone Center",
    date: "2025-01-20",
    time: "8:00 AM - 8:00 PM",
    staffAssigned: [
      { name: "Alex Rodriguez", role: "Setup Lead", status: "pending" },
      { name: "Sarah Johnson", role: "Brand Ambassador", status: "confirmed" },
      { name: "Mike Chen", role: "Technical Support", status: "confirmed" }
    ],
    status: "partially_assigned",
    priority: "high",
    client: "Event Solutions"
  },
  {
    id: 4,
    bookingId: "BK-004",
    eventName: "Store Demo - Target",
    location: "Target Union Square",
    date: "2025-01-23",
    time: "11:00 AM - 7:00 PM",
    staffAssigned: [],
    status: "unassigned",
    priority: "low",
    client: "Retail Partner"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "fully_assigned":
      return "bg-green-100 text-green-800";
    case "partially_assigned":
      return "bg-yellow-100 text-yellow-800";
    case "needs_staff":
      return "bg-orange-100 text-orange-800";
    case "unassigned":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function BookingAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesSearch = assignment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserCheck className="h-8 w-8 mr-3 text-primary" />
            Booking Assignments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff assignments for bookings and events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Auto-Assign
          </Button>
          <Link href="/bookings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="fully_assigned">Fully Assigned</SelectItem>
                <SelectItem value="partially_assigned">Partially Assigned</SelectItem>
                <SelectItem value="needs_staff">Needs Staff</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockAssignments.length}</div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockAssignments.filter(a => a.status === "fully_assigned").length}
            </div>
            <div className="text-sm text-muted-foreground">Fully Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockAssignments.filter(a => a.status === "needs_staff" || a.status === "partially_assigned").length}
            </div>
            <div className="text-sm text-muted-foreground">Need Attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {mockAssignments.filter(a => a.status === "unassigned").length}
            </div>
            <div className="text-sm text-muted-foreground">Unassigned</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Overview</CardTitle>
          <CardDescription>
            Manage staff assignments for upcoming events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.eventName}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {assignment.location}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.bookingId} • {assignment.client}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{assignment.date}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {assignment.time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {assignment.staffAssigned.length > 0 ? (
                        assignment.staffAssigned.map((staff, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{staff.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {staff.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No staff assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(assignment.priority)}>
                      {assignment.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/bookings/${assignment.bookingId}/edit`}>
                        <Button variant="outline" size="sm">
                          Assign
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}