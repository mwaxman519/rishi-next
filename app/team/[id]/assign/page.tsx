&quot;use client&quot;;

import { useState, use } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import Link from &quot;next/link&quot;;

interface AssignTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

const ASSIGNMENT_EVENTS = {
  MEMBER_ASSIGNED: &quot;team.member.assigned&quot;,
  ASSIGNMENT_CREATED: &quot;assignment.created&quot;,
  EVENT_STAFFING_UPDATED: &quot;event.staffing.updated&quot;,
} as const;

const publishEvent = async (eventType: string, payload: any) => {
  try {
    const response = await fetch(&quot;/api/events/publish&quot;, {
      method: &quot;POST&quot;,
      headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
      body: JSON.stringify({
        eventType,
        payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(&quot;Failed to publish event&quot;);
    }

    return await response.json();
  } catch (error) {
    console.error(&quot;Event publishing failed:&quot;, error);
    throw error;
  }
};

const availableEvents = [
  {
    id: &quot;evt-001&quot;,
    name: &quot;Tech Conference 2024&quot;,
    date: &quot;2024-06-25&quot;,
    time: &quot;09:00 - 17:00&quot;,
    location: &quot;San Francisco Convention Center&quot;,
    type: &quot;Conference&quot;,
    status: &quot;open&quot;,
    requiredSkills: [&quot;Product Demo&quot;, &quot;Public Speaking&quot;],
    compensation: 350,
    description:
      &quot;Major technology conference with product demonstrations and networking.&quot;,
  },
  {
    id: &quot;evt-002&quot;,
    name: &quot;Retail Product Launch&quot;,
    date: &quot;2024-06-28&quot;,
    time: &quot;10:00 - 18:00&quot;,
    location: &quot;Union Square, SF&quot;,
    type: &quot;Product Launch&quot;,
    status: &quot;open&quot;,
    requiredSkills: [&quot;Retail Activation&quot;, &quot;Customer Engagement&quot;],
    compensation: 280,
    description: &quot;New product launch event at flagship retail location.&quot;,
  },
  {
    id: &quot;evt-003&quot;,
    name: &quot;Corporate Training Session&quot;,
    date: &quot;2024-07-02&quot;,
    time: &quot;13:00 - 16:00&quot;,
    location: &quot;Downtown Office Building&quot;,
    type: &quot;Training&quot;,
    status: &quot;urgent&quot;,
    requiredSkills: [&quot;Corporate Events&quot;, &quot;Training&quot;],
    compensation: 200,
    description: &quot;Employee training session for new product features.&quot;,
  },
];

export default function AssignTeamMemberPage({
  params,
}: AssignTeamMemberProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [filterType, setFilterType] = useState(&quot;all&quot;);
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredEvents = availableEvents.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === &quot;all&quot; || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  };

  const handleAssignment = async () => {
    if (selectedEvents.length === 0) {
      toast({
        title: &quot;No Events Selected&quot;,
        description: &quot;Please select at least one event to assign.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsAssigning(true);

    try {
      const assignments = selectedEvents.map((eventId) => ({
        memberId: params.id,
        eventId,
        assignedAt: new Date().toISOString(),
        assignedBy: &quot;current-user-id&quot;,
        status: &quot;assigned&quot;,
      }));

      const response = await fetch(&quot;/api/assignments/bulk&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        throw new Error(&quot;Failed to create assignments&quot;);
      }

      // Publish events for each assignment
      for (const eventId of selectedEvents) {
        const event = availableEvents.find((e) => e.id === eventId);

        await publishEvent(ASSIGNMENT_EVENTS.MEMBER_ASSIGNED, {
          memberId: id,
          eventId,
          eventName: event?.name,
          assignedBy: &quot;current-user-id&quot;,
          organizationId: &quot;current-org-id&quot;,
          assignmentDetails: {
            compensation: event?.compensation,
            requiredSkills: event?.requiredSkills,
            eventDate: event?.date,
          },
        });

        await publishEvent(ASSIGNMENT_EVENTS.EVENT_STAFFING_UPDATED, {
          eventId,
          staffingChange: {
            type: &quot;assignment_added&quot;,
            memberId: params.id,
            previousCount: 0, // Would come from API
            newCount: 1, // Would come from API
          },
          updatedBy: &quot;current-user-id&quot;,
        });
      }

      toast({
        title: &quot;Assignment Successful&quot;,
        description: `Team member assigned to ${selectedEvents.length} event(s).`,
      });

      router.push(`/team/${params.id}`);
    } catch (error) {
      toast({
        title: &quot;Assignment Failed&quot;,
        description: &quot;Failed to assign team member. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex items-center space-x-4&quot;>
        <Button variant=&quot;outline&quot; size=&quot;sm&quot; asChild>
          <Link href={`/team/${params.id}`}>
            <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
            Back to Profile
          </Link>
        </Button>
        <div className=&quot;flex-1&quot;>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Assign to Events
          </h1>
          <p className=&quot;text-muted-foreground&quot;>
            Select events to assign this team member
          </p>
        </div>
        <div className=&quot;flex space-x-2&quot;>
          <Button variant=&quot;outline&quot; onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignment}
            disabled={selectedEvents.length === 0 || isAssigning}
          >
            <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
            {isAssigning
              ? &quot;Assigning...&quot;
              : `Assign to ${selectedEvents.length} Event(s)`}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>
            Search and filter events to find suitable assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-col sm:flex-row gap-4 mb-6&quot;>
            <div className=&quot;flex-1&quot;>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4&quot; />
                <Input
                  placeholder=&quot;Search events...&quot;
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=&quot;pl-10&quot;
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className=&quot;w-[200px]&quot;>
                <SelectValue placeholder=&quot;Filter by type&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Types</SelectItem>
                <SelectItem value=&quot;Conference&quot;>Conference</SelectItem>
                <SelectItem value=&quot;Product Launch&quot;>Product Launch</SelectItem>
                <SelectItem value=&quot;Training&quot;>Training</SelectItem>
                <SelectItem value=&quot;Trade Show&quot;>Trade Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events List */}
          <div className=&quot;space-y-4&quot;>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className=&quot;flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50&quot;
              >
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => handleEventToggle(event.id)}
                  className=&quot;mt-1&quot;
                />

                <div className=&quot;flex-1 space-y-2&quot;>
                  <div className=&quot;flex items-start justify-between&quot;>
                    <div>
                      <h3 className=&quot;font-semibold text-lg&quot;>{event.name}</h3>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {event.description}
                      </p>
                    </div>
                    <div className=&quot;text-right&quot;>
                      <div className=&quot;text-lg font-bold text-green-600&quot;>
                        ${event.compensation}
                      </div>
                      <Badge
                        variant={
                          event.status === &quot;urgent&quot;
                            ? &quot;destructive&quot;
                            : &quot;secondary&quot;
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4 text-sm&quot;>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
                      <span>{event.time}</span>
                    </div>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <MapPin className=&quot;h-4 w-4 text-muted-foreground&quot; />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className=&quot;flex items-center space-x-2&quot;>
                    <span className=&quot;text-sm text-muted-foreground&quot;>
                      Required Skills:
                    </span>
                    <div className=&quot;flex flex-wrap gap-1&quot;>
                      {event.requiredSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant=&quot;outline&quot;
                          className=&quot;text-xs&quot;
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className=&quot;text-center py-8 text-muted-foreground&quot;>
                No events found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Events Summary */}
      {selectedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Summary</CardTitle>
            <CardDescription>
              Review selected events before confirming assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-2&quot;>
              <p className=&quot;font-medium&quot;>
                Selected Events: {selectedEvents.length}
              </p>
              <p className=&quot;text-sm text-muted-foreground&quot;>
                Total Compensation: $
                {selectedEvents.reduce((total, eventId) => {
                  const event = availableEvents.find((e) => e.id === eventId);
                  return total + (event?.compensation || 0);
                }, 0)}
              </p>
              <div className=&quot;mt-4&quot;>
                <p className=&quot;text-sm font-medium mb-2&quot;>Events:</p>
                <ul className=&quot;space-y-1&quot;>
                  {selectedEvents.map((eventId) => {
                    const event = availableEvents.find((e) => e.id === eventId);
                    return (
                      <li
                        key={eventId}
                        className=&quot;text-sm flex justify-between&quot;
                      >
                        <span>{event?.name}</span>
                        <span className=&quot;text-muted-foreground">
                          {event?.date}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
