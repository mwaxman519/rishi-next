&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { UserCheck, Calendar, MapPin, Clock, Plus, Search } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import Link from &quot;next/link&quot;;

// Mock assignment data
const mockAssignments = [
  {
    id: 1,
    bookingId: &quot;BK-001&quot;,
    eventName: &quot;Product Demo - Best Buy&quot;,
    location: &quot;Best Buy Downtown SF&quot;,
    date: &quot;2025-01-15&quot;,
    time: &quot;10:00 AM - 6:00 PM&quot;,
    staffAssigned: [
      { name: &quot;Sarah Johnson&quot;, role: &quot;Lead Ambassador&quot;, status: &quot;confirmed&quot; },
      { name: &quot;Mike Chen&quot;, role: &quot;Support Staff&quot;, status: &quot;confirmed&quot; }
    ],
    status: &quot;fully_assigned&quot;,
    priority: &quot;high&quot;,
    client: &quot;Tech Corp&quot;
  },
  {
    id: 2,
    bookingId: &quot;BK-002&quot;,
    eventName: &quot;Brand Activation - Whole Foods&quot;,
    location: &quot;Whole Foods Mission Bay&quot;,
    date: &quot;2025-01-17&quot;,
    time: &quot;9:00 AM - 5:00 PM&quot;,
    staffAssigned: [
      { name: &quot;Jessica Smith&quot;, role: &quot;Brand Ambassador&quot;, status: &quot;confirmed&quot; }
    ],
    status: &quot;needs_staff&quot;,
    priority: &quot;medium&quot;,
    client: &quot;Wellness Brand&quot;
  },
  {
    id: 3,
    bookingId: &quot;BK-003&quot;,
    eventName: &quot;Trade Show Setup&quot;,
    location: &quot;Moscone Center&quot;,
    date: &quot;2025-01-20&quot;,
    time: &quot;8:00 AM - 8:00 PM&quot;,
    staffAssigned: [
      { name: &quot;Alex Rodriguez&quot;, role: &quot;Setup Lead&quot;, status: &quot;pending&quot; },
      { name: &quot;Sarah Johnson&quot;, role: &quot;Brand Ambassador&quot;, status: &quot;confirmed&quot; },
      { name: &quot;Mike Chen&quot;, role: &quot;Technical Support&quot;, status: &quot;confirmed&quot; }
    ],
    status: &quot;partially_assigned&quot;,
    priority: &quot;high&quot;,
    client: &quot;Event Solutions&quot;
  },
  {
    id: 4,
    bookingId: &quot;BK-004&quot;,
    eventName: &quot;Store Demo - Target&quot;,
    location: &quot;Target Union Square&quot;,
    date: &quot;2025-01-23&quot;,
    time: &quot;11:00 AM - 7:00 PM&quot;,
    staffAssigned: [],
    status: &quot;unassigned&quot;,
    priority: &quot;low&quot;,
    client: &quot;Retail Partner&quot;
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case &quot;fully_assigned&quot;:
      return &quot;bg-green-100 text-green-800&quot;;
    case &quot;partially_assigned&quot;:
      return &quot;bg-yellow-100 text-yellow-800&quot;;
    case &quot;needs_staff&quot;:
      return &quot;bg-orange-100 text-orange-800&quot;;
    case &quot;unassigned&quot;:
      return &quot;bg-red-100 text-red-800&quot;;
    default:
      return &quot;bg-gray-100 text-gray-800&quot;;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case &quot;high&quot;:
      return &quot;bg-red-100 text-red-800&quot;;
    case &quot;medium&quot;:
      return &quot;bg-yellow-100 text-yellow-800&quot;;
    case &quot;low&quot;:
      return &quot;bg-green-100 text-green-800&quot;;
    default:
      return &quot;bg-gray-100 text-gray-800&quot;;
  }
};

export default function BookingAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [priorityFilter, setPriorityFilter] = useState(&quot;all&quot;);

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesSearch = assignment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === &quot;all&quot; || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === &quot;all&quot; || assignment.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight flex items-center&quot;>
            <UserCheck className=&quot;h-8 w-8 mr-3 text-primary&quot; />
            Booking Assignments
          </h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            Manage staff assignments for bookings and events
          </p>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button variant=&quot;outline&quot;>
            Auto-Assign
          </Button>
          <Link href=&quot;/bookings/new&quot;>
            <Button>
              <Plus className=&quot;h-4 w-4 mr-2&quot; />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className=&quot;text-lg&quot;>Assignment Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
            <div className=&quot;flex-1&quot;>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                <Input
                  placeholder=&quot;Search assignments...&quot;
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=&quot;pl-10&quot;
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className=&quot;w-44&quot;>
                <SelectValue placeholder=&quot;Filter by status&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                <SelectItem value=&quot;fully_assigned&quot;>Fully Assigned</SelectItem>
                <SelectItem value=&quot;partially_assigned&quot;>Partially Assigned</SelectItem>
                <SelectItem value=&quot;needs_staff&quot;>Needs Staff</SelectItem>
                <SelectItem value=&quot;unassigned&quot;>Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className=&quot;w-36&quot;>
                <SelectValue placeholder=&quot;Priority&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Priority</SelectItem>
                <SelectItem value=&quot;high&quot;>High</SelectItem>
                <SelectItem value=&quot;medium&quot;>Medium</SelectItem>
                <SelectItem value=&quot;low&quot;>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold&quot;>{mockAssignments.length}</div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-green-600&quot;>
              {mockAssignments.filter(a => a.status === &quot;fully_assigned&quot;).length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Fully Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-yellow-600&quot;>
              {mockAssignments.filter(a => a.status === &quot;needs_staff&quot; || a.status === &quot;partially_assigned&quot;).length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Need Attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-red-600&quot;>
              {mockAssignments.filter(a => a.status === &quot;unassigned&quot;).length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Unassigned</div>
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
                      <div className=&quot;font-medium&quot;>{assignment.eventName}</div>
                      <div className=&quot;text-sm text-muted-foreground flex items-center&quot;>
                        <MapPin className=&quot;h-3 w-3 mr-1&quot; />
                        {assignment.location}
                      </div>
                      <div className=&quot;text-sm text-muted-foreground&quot;>
                        {assignment.bookingId} • {assignment.client}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className=&quot;flex items-center&quot;>
                      <Calendar className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                      <div>
                        <div className=&quot;font-medium&quot;>{assignment.date}</div>
                        <div className=&quot;text-sm text-muted-foreground flex items-center&quot;>
                          <Clock className=&quot;h-3 w-3 mr-1&quot; />
                          {assignment.time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className=&quot;space-y-1&quot;>
                      {assignment.staffAssigned.length > 0 ? (
                        assignment.staffAssigned.map((staff, index) => (
                          <div key={index} className=&quot;flex items-center justify-between&quot;>
                            <span className=&quot;text-sm&quot;>{staff.name}</span>
                            <Badge variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                              {staff.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <span className=&quot;text-sm text-muted-foreground&quot;>No staff assigned</span>
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
                    <div className=&quot;flex gap-2&quot;>
                      <Link href={`/bookings/${assignment.bookingId}/edit`}>
                        <Button variant=&quot;outline&quot; size=&quot;sm">
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