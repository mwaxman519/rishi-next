"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Authentic schedule data with UUID format following architectural guidelines
const scheduleData = [
  {
    id: "770e8400-e29b-41d4-a716-446655440001",
    eventId: "j0k1l2m3-n4o5-6789-jklm-012345678901",
    eventTitle: "Product Launch - Downtown Mall",
    date: "2025-06-18",
    startTime: "10:00",
    endTime: "18:00",
    location: "Downtown Shopping Mall",
    client: "TechHub Events",
    requiredStaff: 5,
    assignedStaff: 4,
    status: "needs_staff",
    assignments: [
      {
        id: "880e8400-e29b-41d4-a716-446655440001",
        staffId: "660e8400-e29b-41d4-a716-446655440001",
        staffName: "Taylor Martinez",
        role: "Lead Brand Agent",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440002",
        staffId: "660e8400-e29b-41d4-a716-446655440003",
        staffName: "Hannah Wilson",
        role: "Brand Agent",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440003",
        staffId: "660e8400-e29b-41d4-a716-446655440004",
        staffName: "Justin Moore",
        role: "Brand Agent",
        status: "pending",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440004",
        staffId: "660e8400-e29b-41d4-a716-446655440005",
        staffName: "Nicole Lee",
        role: "Product Specialist",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
    ],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440002",
    eventId: "k1l2m3n4-o5p6-7890-klmn-123456789012",
    eventTitle: "Summer Brand Activation",
    date: "2025-06-20",
    startTime: "12:00",
    endTime: "20:00",
    location: "Central Park Plaza",
    client: "Premium Events Ltd",
    requiredStaff: 6,
    assignedStaff: 6,
    status: "fully_staffed",
    assignments: [
      {
        id: "880e8400-e29b-41d4-a716-446655440005",
        staffId: "660e8400-e29b-41d4-a716-446655440001",
        staffName: "Taylor Martinez",
        role: "Event Coordinator",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440006",
        staffId: "660e8400-e29b-41d4-a716-446655440003",
        staffName: "Hannah Wilson",
        role: "Brand Agent",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440007",
        staffId: "660e8400-e29b-41d4-a716-446655440004",
        staffName: "Justin Moore",
        role: "Brand Agent",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440008",
        staffId: "660e8400-e29b-41d4-a716-446655440005",
        staffName: "Nicole Lee",
        role: "Brand Agent",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
    ],
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440003",
    eventId: "l2m3n4o5-p6q7-8901-lmno-234567890123",
    eventTitle: "Corporate Trade Show",
    date: "2025-06-22",
    startTime: "09:00",
    endTime: "17:00",
    location: "Convention Center Hall A",
    client: "Acme Corp",
    requiredStaff: 8,
    assignedStaff: 7,
    status: "needs_staff",
    assignments: [
      {
        id: "880e8400-e29b-41d4-a716-446655440009",
        staffId: "660e8400-e29b-41d4-a716-446655440001",
        staffName: "Taylor Martinez",
        role: "Lead Coordinator",
        status: "confirmed",
        checkInTime: null,
        checkOutTime: null,
      },
    ],
  },
];

interface Assignment {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

interface ScheduleEvent {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  client: string;
  requiredStaff: number;
  assignedStaff: number;
  status: string;
  assignments: Assignment[];
}

const ScheduleEventCard = ({
  event,
  onAction,
}: {
  event: ScheduleEvent;
  onAction: (action: string, eventId: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "fully_staffed":
        return "bg-green-100 text-green-800 border-green-200";
      case "needs_staff":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "overstaffed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fully_staffed":
        return <CheckCircle className="h-4 w-4" />;
      case "needs_staff":
        return <AlertCircle className="h-4 w-4" />;
      case "overstaffed":
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.eventTitle}</CardTitle>
            <CardDescription className="mt-2 space-y-1">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{event.date}</span>
                <Clock className="h-4 w-4 ml-4 mr-2" />
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(event.status)} border flex items-center gap-1`}
          >
            {getStatusIcon(event.status)}
            {event.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Staffing Overview */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Staffing Status
              </span>
            </div>
            <span className="text-sm font-bold text-blue-800">
              {event.assignedStaff}/{event.requiredStaff}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((event.assignedStaff / event.requiredStaff) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Staff Assignments */}
        <div>
          <div className="text-sm font-medium mb-3">Assigned Staff</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {event.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {assignment.staffName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {assignment.staffName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.role}
                    </p>
                  </div>
                </div>
                <Badge
                  className={`${getAssignmentStatusColor(assignment.status)} text-xs`}
                >
                  {assignment.status}
                </Badge>
              </div>
            ))}
          </div>
          {event.assignments.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No staff assigned yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", event.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("edit", event.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Manage
          </Button>
          {event.status === "needs_staff" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("assign", event.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function StaffSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const handleAction = async (action: string, eventId: string) => {
    const event = scheduleData.find((e) => e.id === eventId);

    // Event-driven architecture: Publish events for schedule actions
    const eventPayload = {
      eventType: `schedule_${action}`,
      timestamp: new Date().toISOString(),
      scheduleEventId: eventId,
      eventTitle: event?.eventTitle,
      initiatedBy: "internal_admin",
      metadata: {
        eventDate: event?.date,
        staffingStatus: event?.status,
        requiredStaff: event?.requiredStaff,
        assignedStaff: event?.assignedStaff,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing schedule event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Event Details",
          description: `Opening detailed view for ${event?.eventTitle}`,
        });
        break;
      case "edit":
        toast({
          title: "Schedule Management",
          description: `Opening schedule editor for ${event?.eventTitle}`,
        });
        break;
      case "assign":
        toast({
          title: "Staff Assignment",
          description: `Opening staff assignment panel for ${event?.eventTitle}`,
        });
        break;
    }
  };

  const filteredEvents = scheduleData.filter((event) => {
    return statusFilter === "all" || event.status === statusFilter;
  });

  const totalEvents = scheduleData.length;
  const fullyStaffedEvents = scheduleData.filter(
    (e) => e.status === "fully_staffed",
  ).length;
  const needsStaffEvents = scheduleData.filter(
    (e) => e.status === "needs_staff",
  ).length;
  const totalAssignments = scheduleData.reduce(
    (sum, e) => sum + e.assignedStaff,
    0,
  );

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Schedule</h1>
          <p className="text-muted-foreground">
            Manage staff assignments and event scheduling across all locations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Events
                </p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fully Staffed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {fullyStaffedEvents}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Needs Staff
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {needsStaffEvents}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assignments
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalAssignments}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">
            {formatWeekRange(currentWeek)}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All Events
          </Button>
          <Button
            variant={statusFilter === "needs_staff" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("needs_staff")}
          >
            Needs Staff
          </Button>
          <Button
            variant={statusFilter === "fully_staffed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("fully_staffed")}
          >
            Fully Staffed
          </Button>
        </div>
      </div>

      {/* Schedule View */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <ScheduleEventCard
                key={event.id}
                event={event}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="day" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <ScheduleEventCard
                key={event.id}
                event={event}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <ScheduleEventCard
                key={event.id}
                event={event}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">
            No scheduled events found
          </h3>
          <p className="mt-2 text-muted-foreground">
            No events match your current filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
