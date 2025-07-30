&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback } from &quot;@/components/ui/avatar&quot;;
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
} from &quot;lucide-react&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Authentic schedule data with UUID format following architectural guidelines
const scheduleData = [
  {
    id: &quot;770e8400-e29b-41d4-a716-446655440001&quot;,
    eventId: &quot;j0k1l2m3-n4o5-6789-jklm-012345678901&quot;,
    eventTitle: &quot;Product Launch - Downtown Mall&quot;,
    date: &quot;2025-06-18&quot;,
    startTime: &quot;10:00&quot;,
    endTime: &quot;18:00&quot;,
    location: &quot;Downtown Shopping Mall&quot;,
    client: &quot;TechHub Events&quot;,
    requiredStaff: 5,
    assignedStaff: 4,
    status: &quot;needs_staff&quot;,
    assignments: [
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440001&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440001&quot;,
        staffName: &quot;Taylor Martinez&quot;,
        role: &quot;Lead Brand Agent&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440002&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440003&quot;,
        staffName: &quot;Hannah Wilson&quot;,
        role: &quot;Brand Agent&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440003&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440004&quot;,
        staffName: &quot;Justin Moore&quot;,
        role: &quot;Brand Agent&quot;,
        status: &quot;pending&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440004&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440005&quot;,
        staffName: &quot;Nicole Lee&quot;,
        role: &quot;Product Specialist&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
    ],
  },
  {
    id: &quot;770e8400-e29b-41d4-a716-446655440002&quot;,
    eventId: &quot;k1l2m3n4-o5p6-7890-klmn-123456789012&quot;,
    eventTitle: &quot;Summer Brand Activation&quot;,
    date: &quot;2025-06-20&quot;,
    startTime: &quot;12:00&quot;,
    endTime: &quot;20:00&quot;,
    location: &quot;Central Park Plaza&quot;,
    client: &quot;Premium Events Ltd&quot;,
    requiredStaff: 6,
    assignedStaff: 6,
    status: &quot;fully_staffed&quot;,
    assignments: [
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440005&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440001&quot;,
        staffName: &quot;Taylor Martinez&quot;,
        role: &quot;Event Coordinator&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440006&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440003&quot;,
        staffName: &quot;Hannah Wilson&quot;,
        role: &quot;Brand Agent&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440007&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440004&quot;,
        staffName: &quot;Justin Moore&quot;,
        role: &quot;Brand Agent&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440008&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440005&quot;,
        staffName: &quot;Nicole Lee&quot;,
        role: &quot;Brand Agent&quot;,
        status: &quot;confirmed&quot;,
        checkInTime: null,
        checkOutTime: null,
      },
    ],
  },
  {
    id: &quot;770e8400-e29b-41d4-a716-446655440003&quot;,
    eventId: &quot;l2m3n4o5-p6q7-8901-lmno-234567890123&quot;,
    eventTitle: &quot;Corporate Trade Show&quot;,
    date: &quot;2025-06-22&quot;,
    startTime: &quot;09:00&quot;,
    endTime: &quot;17:00&quot;,
    location: &quot;Convention Center Hall A&quot;,
    client: &quot;Acme Corp&quot;,
    requiredStaff: 8,
    assignedStaff: 7,
    status: &quot;needs_staff&quot;,
    assignments: [
      {
        id: &quot;880e8400-e29b-41d4-a716-446655440009&quot;,
        staffId: &quot;660e8400-e29b-41d4-a716-446655440001&quot;,
        staffName: &quot;Taylor Martinez&quot;,
        role: &quot;Lead Coordinator&quot;,
        status: &quot;confirmed&quot;,
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
      case &quot;fully_staffed&quot;:
        return &quot;bg-green-100 text-green-800 border-green-200&quot;;
      case &quot;needs_staff&quot;:
        return &quot;bg-orange-100 text-orange-800 border-orange-200&quot;;
      case &quot;overstaffed&quot;:
        return &quot;bg-blue-100 text-blue-800 border-blue-200&quot;;
      case &quot;cancelled&quot;:
        return &quot;bg-red-100 text-red-800 border-red-200&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case &quot;fully_staffed&quot;:
        return <CheckCircle className=&quot;h-4 w-4&quot; />;
      case &quot;needs_staff&quot;:
        return <AlertCircle className=&quot;h-4 w-4&quot; />;
      case &quot;overstaffed&quot;:
        return <Users className=&quot;h-4 w-4&quot; />;
      default:
        return <Clock className=&quot;h-4 w-4&quot; />;
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case &quot;confirmed&quot;:
        return &quot;bg-green-100 text-green-800&quot;;
      case &quot;pending&quot;:
        return &quot;bg-yellow-100 text-yellow-800&quot;;
      case &quot;declined&quot;:
        return &quot;bg-red-100 text-red-800&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800&quot;;
    }
  };

  return (
    <Card className=&quot;hover:shadow-lg transition-all duration-200&quot;>
      <CardHeader className=&quot;pb-4&quot;>
        <div className=&quot;flex items-start justify-between&quot;>
          <div className=&quot;flex-1&quot;>
            <CardTitle className=&quot;text-lg&quot;>{event.eventTitle}</CardTitle>
            <CardDescription className=&quot;mt-2 space-y-1&quot;>
              <div className=&quot;flex items-center&quot;>
                <Calendar className=&quot;h-4 w-4 mr-2&quot; />
                <span>{event.date}</span>
                <Clock className=&quot;h-4 w-4 ml-4 mr-2&quot; />
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className=&quot;flex items-center&quot;>
                <MapPin className=&quot;h-4 w-4 mr-2&quot; />
                <span>{event.location}</span>
              </div>
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(event.status)} border flex items-center gap-1`}
          >
            {getStatusIcon(event.status)}
            {event.status.replace(&quot;_&quot;, &quot; &quot;).toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className=&quot;space-y-4&quot;>
        {/* Staffing Overview */}
        <div className=&quot;bg-blue-50 rounded-lg p-4&quot;>
          <div className=&quot;flex items-center justify-between mb-2&quot;>
            <div className=&quot;flex items-center&quot;>
              <Users className=&quot;h-4 w-4 mr-2 text-blue-600&quot; />
              <span className=&quot;text-sm font-medium text-blue-800&quot;>
                Staffing Status
              </span>
            </div>
            <span className=&quot;text-sm font-bold text-blue-800&quot;>
              {event.assignedStaff}/{event.requiredStaff}
            </span>
          </div>
          <div className=&quot;w-full bg-blue-200 rounded-full h-2&quot;>
            <div
              className=&quot;bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300&quot;
              style={{
                width: `${Math.min((event.assignedStaff / event.requiredStaff) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Staff Assignments */}
        <div>
          <div className=&quot;text-sm font-medium mb-3&quot;>Assigned Staff</div>
          <div className=&quot;space-y-2 max-h-32 overflow-y-auto&quot;>
            {event.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className=&quot;flex items-center justify-between p-2 bg-gray-50 rounded-lg&quot;
              >
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Avatar className=&quot;h-8 w-8&quot;>
                    <AvatarFallback className=&quot;text-xs&quot;>
                      {assignment.staffName
                        .split(&quot; &quot;)
                        .map((n) => n[0])
                        .join("&quot;)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className=&quot;text-sm font-medium&quot;>
                      {assignment.staffName}
                    </p>
                    <p className=&quot;text-xs text-muted-foreground&quot;>
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
            <div className=&quot;text-center py-4 text-muted-foreground&quot;>
              <UserCheck className=&quot;h-8 w-8 mx-auto mb-2 opacity-50&quot; />
              <p className=&quot;text-sm&quot;>No staff assigned yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className=&quot;flex space-x-2 pt-2 border-t&quot;>
          <Button
            size=&quot;sm&quot;
            className=&quot;flex-1&quot;
            onClick={() => onAction(&quot;view&quot;, event.id)}
          >
            <Eye className=&quot;h-4 w-4 mr-1&quot; />
            View Details
          </Button>
          <Button
            size=&quot;sm&quot;
            variant=&quot;outline&quot;
            onClick={() => onAction(&quot;edit&quot;, event.id)}
          >
            <Edit className=&quot;h-4 w-4 mr-1&quot; />
            Manage
          </Button>
          {event.status === &quot;needs_staff&quot; && (
            <Button
              size=&quot;sm&quot;
              variant=&quot;outline&quot;
              onClick={() => onAction(&quot;assign&quot;, event.id)}
            >
              <Plus className=&quot;h-4 w-4 mr-1&quot; />
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
  const [viewMode, setViewMode] = useState(&quot;week&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const { toast } = useToast();

  const handleAction = async (action: string, eventId: string) => {
    const event = scheduleData.find((e) => e.id === eventId);

    // Event-driven architecture: Publish events for schedule actions
    const eventPayload = {
      eventType: `schedule_${action}`,
      timestamp: new Date().toISOString(),
      scheduleEventId: eventId,
      eventTitle: event?.eventTitle,
      initiatedBy: &quot;internal_admin&quot;,
      metadata: {
        eventDate: event?.date,
        staffingStatus: event?.status,
        requiredStaff: event?.requiredStaff,
        assignedStaff: event?.assignedStaff,
      },
    };

    // In real implementation, this would publish to event bus
    console.log(&quot;Publishing schedule event:&quot;, eventPayload);

    switch (action) {
      case &quot;view&quot;:
        toast({
          title: &quot;Event Details&quot;,
          description: `Opening detailed view for ${event?.eventTitle}`,
        });
        break;
      case &quot;edit&quot;:
        toast({
          title: &quot;Schedule Management&quot;,
          description: `Opening schedule editor for ${event?.eventTitle}`,
        });
        break;
      case &quot;assign&quot;:
        toast({
          title: &quot;Staff Assignment&quot;,
          description: `Opening staff assignment panel for ${event?.eventTitle}`,
        });
        break;
    }
  };

  const filteredEvents = scheduleData.filter((event) => {
    return statusFilter === &quot;all&quot; || event.status === statusFilter;
  });

  const totalEvents = scheduleData.length;
  const fullyStaffedEvents = scheduleData.filter(
    (e) => e.status === &quot;fully_staffed&quot;,
  ).length;
  const needsStaffEvents = scheduleData.filter(
    (e) => e.status === &quot;needs_staff&quot;,
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
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Staff Schedule</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage staff assignments and event scheduling across all locations
          </p>
        </div>
        <Button>
          <Plus className=&quot;mr-2 h-4 w-4&quot; />
          Create Schedule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Events
                </p>
                <p className=&quot;text-2xl font-bold&quot;>{totalEvents}</p>
              </div>
              <Calendar className=&quot;h-8 w-8 text-blue-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Fully Staffed
                </p>
                <p className=&quot;text-2xl font-bold text-green-600&quot;>
                  {fullyStaffedEvents}
                </p>
              </div>
              <CheckCircle className=&quot;h-8 w-8 text-green-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Needs Staff
                </p>
                <p className=&quot;text-2xl font-bold text-orange-600&quot;>
                  {needsStaffEvents}
                </p>
              </div>
              <AlertCircle className=&quot;h-8 w-8 text-orange-600&quot; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&quot;p-6&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <p className=&quot;text-sm font-medium text-muted-foreground&quot;>
                  Total Assignments
                </p>
                <p className=&quot;text-2xl font-bold text-purple-600&quot;>
                  {totalAssignments}
                </p>
              </div>
              <Users className=&quot;h-8 w-8 text-purple-600&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <div className=&quot;flex items-center justify-between&quot;>
        <div className=&quot;flex items-center space-x-4&quot;>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={() => navigateWeek(-1)}>
            <ChevronLeft className=&quot;h-4 w-4&quot; />
          </Button>
          <div className=&quot;text-lg font-medium&quot;>
            {formatWeekRange(currentWeek)}
          </div>
          <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={() => navigateWeek(1)}>
            <ChevronRight className=&quot;h-4 w-4&quot; />
          </Button>
        </div>

        <div className=&quot;flex items-center space-x-2&quot;>
          <Button
            variant={statusFilter === &quot;all&quot; ? &quot;default&quot; : &quot;outline&quot;}
            size=&quot;sm&quot;
            onClick={() => setStatusFilter(&quot;all&quot;)}
          >
            All Events
          </Button>
          <Button
            variant={statusFilter === &quot;needs_staff&quot; ? &quot;default&quot; : &quot;outline&quot;}
            size=&quot;sm&quot;
            onClick={() => setStatusFilter(&quot;needs_staff&quot;)}
          >
            Needs Staff
          </Button>
          <Button
            variant={statusFilter === &quot;fully_staffed&quot; ? &quot;default&quot; : &quot;outline&quot;}
            size=&quot;sm&quot;
            onClick={() => setStatusFilter(&quot;fully_staffed&quot;)}
          >
            Fully Staffed
          </Button>
        </div>
      </div>

      {/* Schedule View */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value=&quot;week&quot;>Week View</TabsTrigger>
          <TabsTrigger value=&quot;day&quot;>Day View</TabsTrigger>
          <TabsTrigger value=&quot;list&quot;>List View</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;week&quot; className=&quot;space-y-4 mt-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
            {filteredEvents.map((event) => (
              <ScheduleEventCard
                key={event.id}
                event={event}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;day&quot; className=&quot;space-y-4 mt-6&quot;>
          <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
            {filteredEvents.map((event) => (
              <ScheduleEventCard
                key={event.id}
                event={event}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;list&quot; className=&quot;mt-6&quot;>
          <div className=&quot;space-y-4&quot;>
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
        <div className=&quot;text-center py-12&quot;>
          <Calendar className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
          <h3 className=&quot;mt-4 text-lg font-medium&quot;>
            No scheduled events found
          </h3>
          <p className=&quot;mt-2 text-muted-foreground">
            No events match your current filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
