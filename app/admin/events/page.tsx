&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  Search,
  Plus,
} from &quot;lucide-react&quot;;

interface Event {
  id: string;
  title: string;
  type: string;
  status: &quot;active&quot; | &quot;completed&quot; | &quot;cancelled&quot; | &quot;scheduled&quot;;
  date: string;
  location: string;
  organizationId: string;
  organizationName: string;
  assignedStaff: number;
  totalSlots: number;
}

const eventData: Event[] = [
  {
    id: &quot;1&quot;,
    title: &quot;Cannabis Education Workshop&quot;,
    type: &quot;Education&quot;,
    status: &quot;active&quot;,
    date: &quot;2024-01-15&quot;,
    location: &quot;Denver, CO&quot;,
    organizationId: &quot;org1&quot;,
    organizationName: &quot;Green Leaf Dispensary&quot;,
    assignedStaff: 3,
    totalSlots: 5,
  },
  {
    id: &quot;2&quot;,
    title: &quot;Product Launch Event&quot;,
    type: &quot;Product Launch&quot;,
    status: &quot;scheduled&quot;,
    date: &quot;2024-01-20&quot;,
    location: &quot;Los Angeles, CA&quot;,
    organizationId: &quot;org2&quot;,
    organizationName: &quot;Sunset Cannabis Co.&quot;,
    assignedStaff: 2,
    totalSlots: 4,
  },
  {
    id: &quot;3&quot;,
    title: &quot;Store Grand Opening&quot;,
    type: &quot;Grand Opening&quot;,
    status: &quot;completed&quot;,
    date: &quot;2024-01-10&quot;,
    location: &quot;Seattle, WA&quot;,
    organizationId: &quot;org3&quot;,
    organizationName: &quot;Pacific Northwest Cannabis&quot;,
    assignedStaff: 6,
    totalSlots: 6,
  },
];

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>(eventData);
  const [filterStatus, setFilterStatus] = useState<string>(&quot;all&quot;);
  const [searchTerm, setSearchTerm] = useState("&quot;);

  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;active&quot;:
        return &quot;bg-green-100 text-green-800&quot;;
      case &quot;scheduled&quot;:
        return &quot;bg-blue-100 text-blue-800&quot;;
      case &quot;completed&quot;:
        return &quot;bg-gray-100 text-gray-800&quot;;
      case &quot;cancelled&quot;:
        return &quot;bg-red-100 text-red-800&quot;;
      default:
        return &quot;bg-gray-100 text-gray-800&quot;;
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesStatus =
      filterStatus === &quot;all&quot; || event.status === filterStatus;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>Event Management</h1>
          <p className=&quot;text-muted-foreground mt-2&quot;>
            Monitor and manage events across all organizations
          </p>
        </div>
        <Button>
          <Plus className=&quot;w-4 h-4 mr-2&quot; />
          Create Event
        </Button>
      </div>

      <div className=&quot;flex items-center space-x-4&quot;>
        <div className=&quot;flex-1&quot;>
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4&quot; />
            <Input
              placeholder=&quot;Search events, organizations, or locations...&quot;
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=&quot;pl-10&quot;
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className=&quot;w-48&quot;>
            <Filter className=&quot;w-4 h-4 mr-2&quot; />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Status</SelectItem>
            <SelectItem value=&quot;active&quot;>Active</SelectItem>
            <SelectItem value=&quot;scheduled&quot;>Scheduled</SelectItem>
            <SelectItem value=&quot;completed&quot;>Completed</SelectItem>
            <SelectItem value=&quot;cancelled&quot;>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className=&quot;grid gap-6&quot;>
        {filteredEvents.map((event) => (
          <Card key={event.id} className=&quot;hover:shadow-md transition-shadow&quot;>
            <CardHeader>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <CardTitle className=&quot;text-xl&quot;>{event.title}</CardTitle>
                  <CardDescription className=&quot;text-sm text-muted-foreground&quot;>
                    {event.organizationName}
                  </CardDescription>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Badge variant=&quot;outline&quot;>{event.type}</Badge>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&quot;grid grid-cols-2 md:grid-cols-4 gap-4&quot;>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Calendar className=&quot;w-4 h-4 text-muted-foreground&quot; />
                  <span className=&quot;text-sm&quot;>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <MapPin className=&quot;w-4 h-4 text-muted-foreground&quot; />
                  <span className=&quot;text-sm&quot;>{event.location}</span>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Users className=&quot;w-4 h-4 text-muted-foreground&quot; />
                  <span className=&quot;text-sm&quot;>
                    {event.assignedStaff}/{event.totalSlots} Staff
                  </span>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Clock className=&quot;w-4 h-4 text-muted-foreground&quot; />
                  <span className=&quot;text-sm&quot;>
                    {event.status === &quot;active&quot;
                      ? &quot;In Progress&quot;
                      : event.status === &quot;scheduled&quot;
                        ? &quot;Upcoming&quot;
                        : event.status === &quot;completed&quot;
                          ? &quot;Finished&quot;
                          : &quot;Cancelled&quot;}
                  </span>
                </div>
              </div>

              <div className=&quot;flex justify-end space-x-2 mt-4&quot;>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  View Details
                </Button>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  Manage Staff
                </Button>
                {event.status === &quot;scheduled&quot; && (
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                    Edit Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className=&quot;text-center py-12&quot;>
          <p className=&quot;text-muted-foreground">
            No events found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
