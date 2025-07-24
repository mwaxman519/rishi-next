"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  Search,
  Plus,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: string;
  status: "active" | "completed" | "cancelled" | "scheduled";
  date: string;
  location: string;
  organizationId: string;
  organizationName: string;
  assignedStaff: number;
  totalSlots: number;
}

const eventData: Event[] = [
  {
    id: "1",
    title: "Cannabis Education Workshop",
    type: "Education",
    status: "active",
    date: "2024-01-15",
    location: "Denver, CO",
    organizationId: "org1",
    organizationName: "Green Leaf Dispensary",
    assignedStaff: 3,
    totalSlots: 5,
  },
  {
    id: "2",
    title: "Product Launch Event",
    type: "Product Launch",
    status: "scheduled",
    date: "2024-01-20",
    location: "Los Angeles, CA",
    organizationId: "org2",
    organizationName: "Sunset Cannabis Co.",
    assignedStaff: 2,
    totalSlots: 4,
  },
  {
    id: "3",
    title: "Store Grand Opening",
    type: "Grand Opening",
    status: "completed",
    date: "2024-01-10",
    location: "Seattle, WA",
    organizationId: "org3",
    organizationName: "Pacific Northwest Cannabis",
    assignedStaff: 6,
    totalSlots: 6,
  },
];

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>(eventData);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesStatus =
      filterStatus === "all" || event.status === filterStatus;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage events across all organizations
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events, organizations, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {event.organizationName}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{event.type}</Badge>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {event.assignedStaff}/{event.totalSlots} Staff
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {event.status === "active"
                      ? "In Progress"
                      : event.status === "scheduled"
                        ? "Upcoming"
                        : event.status === "completed"
                          ? "Finished"
                          : "Cancelled"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Manage Staff
                </Button>
                {event.status === "scheduled" && (
                  <Button variant="outline" size="sm">
                    Edit Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No events found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
