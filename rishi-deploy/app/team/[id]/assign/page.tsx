"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AssignTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

const ASSIGNMENT_EVENTS = {
  MEMBER_ASSIGNED: "team.member.assigned",
  ASSIGNMENT_CREATED: "assignment.created",
  EVENT_STAFFING_UPDATED: "event.staffing.updated",
} as const;

const publishEvent = async (eventType: string, payload: any) => {
  try {
    const response = await fetch("/api/events/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to publish event");
    }

    return await response.json();
  } catch (error) {
    console.error("Event publishing failed:", error);
    throw error;
  }
};

const availableEvents = [
  {
    id: "evt-001",
    name: "Tech Conference 2024",
    date: "2024-06-25",
    time: "09:00 - 17:00",
    location: "San Francisco Convention Center",
    type: "Conference",
    status: "open",
    requiredSkills: ["Product Demo", "Public Speaking"],
    compensation: 350,
    description:
      "Major technology conference with product demonstrations and networking.",
  },
  {
    id: "evt-002",
    name: "Retail Product Launch",
    date: "2024-06-28",
    time: "10:00 - 18:00",
    location: "Union Square, SF",
    type: "Product Launch",
    status: "open",
    requiredSkills: ["Retail Activation", "Customer Engagement"],
    compensation: 280,
    description: "New product launch event at flagship retail location.",
  },
  {
    id: "evt-003",
    name: "Corporate Training Session",
    date: "2024-07-02",
    time: "13:00 - 16:00",
    location: "Downtown Office Building",
    type: "Training",
    status: "urgent",
    requiredSkills: ["Corporate Events", "Training"],
    compensation: 200,
    description: "Employee training session for new product features.",
  },
];

export default function AssignTeamMemberPage({
  params,
}: AssignTeamMemberProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredEvents = availableEvents.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
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
        title: "No Events Selected",
        description: "Please select at least one event to assign.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      const assignments = selectedEvents.map((eventId) => ({
        memberId: params.id,
        eventId,
        assignedAt: new Date().toISOString(),
        assignedBy: "current-user-id",
        status: "assigned",
      }));

      const response = await fetch("/api/assignments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        throw new Error("Failed to create assignments");
      }

      // Publish events for each assignment
      for (const eventId of selectedEvents) {
        const event = availableEvents.find((e) => e.id === eventId);

        await publishEvent(ASSIGNMENT_EVENTS.MEMBER_ASSIGNED, {
          memberId: id,
          eventId,
          eventName: event?.name,
          assignedBy: "current-user-id",
          organizationId: "current-org-id",
          assignmentDetails: {
            compensation: event?.compensation,
            requiredSkills: event?.requiredSkills,
            eventDate: event?.date,
          },
        });

        await publishEvent(ASSIGNMENT_EVENTS.EVENT_STAFFING_UPDATED, {
          eventId,
          staffingChange: {
            type: "assignment_added",
            memberId: params.id,
            previousCount: 0, // Would come from API
            newCount: 1, // Would come from API
          },
          updatedBy: "current-user-id",
        });
      }

      toast({
        title: "Assignment Successful",
        description: `Team member assigned to ${selectedEvents.length} event(s).`,
      });

      router.push(`/team/${params.id}`);
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/team/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Assign to Events
          </h1>
          <p className="text-muted-foreground">
            Select events to assign this team member
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignment}
            disabled={selectedEvents.length === 0 || isAssigning}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isAssigning
              ? "Assigning..."
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Product Launch">Product Launch</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Trade Show">Trade Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50"
              >
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => handleEventToggle(event.id)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${event.compensation}
                      </div>
                      <Badge
                        variant={
                          event.status === "urgent"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {event.requiredSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
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
              <div className="text-center py-8 text-muted-foreground">
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
            <div className="space-y-2">
              <p className="font-medium">
                Selected Events: {selectedEvents.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Compensation: $
                {selectedEvents.reduce((total, eventId) => {
                  const event = availableEvents.find((e) => e.id === eventId);
                  return total + (event?.compensation || 0);
                }, 0)}
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Events:</p>
                <ul className="space-y-1">
                  {selectedEvents.map((eventId) => {
                    const event = availableEvents.find((e) => e.id === eventId);
                    return (
                      <li
                        key={eventId}
                        className="text-sm flex justify-between"
                      >
                        <span>{event?.name}</span>
                        <span className="text-muted-foreground">
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
