&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { useRouter } from &quot;next/navigation&quot;;

const upcomingEvents = [
  {
    id: 1,
    title: &quot;Product Launch Demo&quot;,
    client: &quot;TechHub Events&quot;,
    date: &quot;2025-06-17&quot;,
    time: &quot;10:00 AM - 6:00 PM&quot;,
    location: &quot;Downtown Mall, Floor 2&quot;,
    status: &quot;confirmed&quot;,
    role: &quot;Lead Brand Ambassador&quot;,
  },
  {
    id: 2,
    title: &quot;Summer Activation&quot;,
    client: &quot;Premium Events Ltd&quot;,
    date: &quot;2025-06-19&quot;,
    time: &quot;12:00 PM - 8:00 PM&quot;,
    location: &quot;Central Park Plaza&quot;,
    status: &quot;pending&quot;,
    role: &quot;Product Specialist&quot;,
  },
  {
    id: 3,
    title: &quot;Trade Show Setup&quot;,
    client: &quot;Acme Corp&quot;,
    date: &quot;2025-06-22&quot;,
    time: &quot;8:00 AM - 10:00 AM&quot;,
    location: &quot;Convention Center Hall A&quot;,
    status: &quot;confirmed&quot;,
    role: &quot;Setup Assistant&quot;,
  },
];

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState(&quot;schedule&quot;);
  const router = useRouter();

  const handleUpdateAvailability = () => {
    router.push(&quot;/availability&quot;);
  };

  return (
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>My Schedule</h1>
          <p className=&quot;text-muted-foreground&quot;>
            View your upcoming events and manage availability
          </p>
        </div>
        <Button onClick={handleUpdateAvailability}>
          <Plus className=&quot;h-4 w-4 mr-2&quot; />
          Update Availability
        </Button>
      </div>

      {/* Quick Stats */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>This Week</CardTitle>
            <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>3</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Scheduled events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Total Hours</CardTitle>
            <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>24</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              Working hours this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Availability</CardTitle>
            <CheckCircle className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>4/7</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Days available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Next Event</CardTitle>
            <AlertCircle className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>Tomorrow</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>10:00 AM start</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className=&quot;space-y-4&quot;>
        <TabsList>
          <TabsTrigger value=&quot;schedule&quot;>Upcoming Events</TabsTrigger>
          <TabsTrigger value=&quot;history&quot;>Event History</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;schedule&quot; className=&quot;space-y-4&quot;>
          {/* Upcoming Events */}
          <div className=&quot;space-y-4&quot;>
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className=&quot;hover:shadow-md transition-shadow&quot;
              >
                <CardContent className=&quot;p-6&quot;>
                  <div className=&quot;flex justify-between items-start&quot;>
                    <div className=&quot;space-y-3 flex-1&quot;>
                      <div className=&quot;flex items-center justify-between&quot;>
                        <h3 className=&quot;text-lg font-semibold&quot;>{event.title}</h3>
                        <Badge
                          variant={
                            event.status === &quot;confirmed&quot;
                              ? &quot;default&quot;
                              : &quot;secondary&quot;
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <div className=&quot;grid md:grid-cols-2 gap-4 text-sm&quot;>
                        <div className=&quot;flex items-center text-muted-foreground&quot;>
                          <User className=&quot;h-4 w-4 mr-2&quot; />
                          <span className=&quot;font-medium text-foreground&quot;>
                            {event.client}
                          </span>
                        </div>
                        <div className=&quot;flex items-center text-muted-foreground&quot;>
                          <Calendar className=&quot;h-4 w-4 mr-2&quot; />
                          <span className=&quot;font-medium text-foreground&quot;>
                            {event.date}
                          </span>
                        </div>
                        <div className=&quot;flex items-center text-muted-foreground&quot;>
                          <Clock className=&quot;h-4 w-4 mr-2&quot; />
                          <span className=&quot;font-medium text-foreground&quot;>
                            {event.time}
                          </span>
                        </div>
                        <div className=&quot;flex items-center text-muted-foreground&quot;>
                          <MapPin className=&quot;h-4 w-4 mr-2&quot; />
                          <span className=&quot;font-medium text-foreground&quot;>
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <div className=&quot;flex items-center justify-between pt-2 border-t&quot;>
                        <span className=&quot;text-sm text-muted-foreground&quot;>
                          Role:{&quot; &quot;}
                          <span className=&quot;font-medium text-foreground&quot;>
                            {event.role}
                          </span>
                        </span>
                        <div className=&quot;space-x-2&quot;>
                          <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                            View Details
                          </Button>
                          {event.status === &quot;pending&quot; && (
                            <>
                              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                                Accept
                              </Button>
                              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;history&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
              <CardDescription>
                View your completed events and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-center py-8&quot;>
                <Calendar className=&quot;h-12 w-12 mx-auto text-muted-foreground mb-4&quot; />
                <h3 className=&quot;text-lg font-medium mb-2&quot;>Event History</h3>
                <p className=&quot;text-muted-foreground&quot;>
                  Your completed events and performance history will be
                  displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
