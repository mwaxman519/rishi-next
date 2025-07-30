&quot;use client&quot;;

import Link from &quot;next/link&quot;;
import { useParams, useRouter } from &quot;next/navigation&quot;;
import { useState } from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import {
  BadgeAlert,
  AlertTriangle,
  Info,
  ChevronLeft,
  Clock,
  User,
  Tag,
  MoreHorizontal,
  MessageSquare,
  CircleCheck,
  UserPlus,
  Users,
  Bell,
  BellOff,
  Share,
  CalendarClock,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;

// Mock alert data
const alertsData = [
  {
    id: 1,
    title: &quot;Database Performance&quot;,
    description:
      &quot;Slow query performance detected in production environment on the main database cluster. Multiple queries taking over 5 seconds to complete.&quot;,
    status: &quot;critical&quot;,
    category: &quot;system&quot;,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
    metrics: [
      {
        name: &quot;Query Response Time&quot;,
        value: &quot;5.2s&quot;,
        change: &quot;+220%&quot;,
        status: &quot;negative&quot;,
      },
      { name: &quot;CPU Usage&quot;, value: &quot;92%&quot;, change: &quot;+45%&quot;, status: &quot;negative&quot; },
      {
        name: &quot;Connection Count&quot;,
        value: &quot;128&quot;,
        change: &quot;+30%&quot;,
        status: &quot;warning&quot;,
      },
    ],
    activity: [
      {
        type: &quot;alert_created&quot;,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: { id: 1, name: &quot;System&quot; },
        message: &quot;Alert created due to slow query performance&quot;,
      },
      {
        type: &quot;metric_change&quot;,
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        user: { id: 1, name: &quot;System&quot; },
        message: &quot;Query response time increased to 5.5s&quot;,
      },
    ],
  },
  {
    id: 2,
    title: &quot;API Rate Limiting&quot;,
    description:
      &quot;Rate limit threshold reached for external API calls. This may impact third-party service integrations.&quot;,
    status: &quot;critical&quot;,
    category: &quot;api&quot;,
    createdAt: new Date(Date.now() - 42 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
    metrics: [
      {
        name: &quot;API Requests/Min&quot;,
        value: &quot;450&quot;,
        change: &quot;+180%&quot;,
        status: &quot;negative&quot;,
      },
      {
        name: &quot;Error Rate&quot;,
        value: &quot;15%&quot;,
        change: &quot;+1200%&quot;,
        status: &quot;negative&quot;,
      },
      {
        name: &quot;Response Time&quot;,
        value: &quot;2.8s&quot;,
        change: &quot;+340%&quot;,
        status: &quot;negative&quot;,
      },
    ],
    activity: [
      {
        type: &quot;alert_created&quot;,
        timestamp: new Date(Date.now() - 42 * 60 * 1000),
        user: { id: 1, name: &quot;System&quot; },
        message: &quot;Alert created due to API rate limit threshold reached&quot;,
      },
    ],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case &quot;critical&quot;:
      return (
        <Badge variant=&quot;destructive&quot; className=&quot;rounded-sm px-2 py-1&quot;>
          Critical
        </Badge>
      );
    case &quot;warning&quot;:
      return (
        <Badge
          variant=&quot;outline&quot;
          className=&quot;bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 rounded-sm px-2 py-1&quot;
        >
          Warning
        </Badge>
      );
    case &quot;info&quot;:
      return (
        <Badge
          variant=&quot;outline&quot;
          className=&quot;bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 rounded-sm px-2 py-1&quot;
        >
          Info
        </Badge>
      );
    default:
      return (
        <Badge variant=&quot;outline&quot; className=&quot;rounded-sm px-2 py-1&quot;>
          {status}
        </Badge>
      );
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case &quot;critical&quot;:
      return <BadgeAlert className=&quot;h-5 w-5 text-red-500&quot; />;
    case &quot;warning&quot;:
      return <AlertTriangle className=&quot;h-5 w-5 text-amber-500&quot; />;
    case &quot;info&quot;:
      return <Info className=&quot;h-5 w-5 text-blue-500&quot; />;
    default:
      return <Info className=&quot;h-5 w-5&quot; />;
  }
};

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newComment, setNewComment] = useState("&quot;);
  const id = typeof params.id === &quot;string&quot; ? parseInt(params.id, 10) : 1;

  // Find the alert by ID
  const alert = alertsData.find((a) => a.id === id) || alertsData[0];
  
  // Handle case where no alert is found
  if (!alert) {
    return (
      <div className=&quot;container mx-auto py-6&quot;>
        <div className=&quot;text-center&quot;>
          <h1 className=&quot;text-2xl font-bold&quot;>Alert Not Found</h1>
          <p className=&quot;text-muted-foreground mt-2&quot;>The requested alert could not be found.</p>
          <Button 
            onClick={() => router.push(&quot;/admin/alerts&quot;)}
            className=&quot;mt-4&quot;
          >
            Back to Alerts
          </Button>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    // Here we would normally push to an API
    console.log(&quot;Adding comment:&quot;, newComment);

    // Clear the input
    setNewComment(&quot;&quot;);
  };

  return (
    <div className=&quot;container mx-auto py-6&quot;>
      <div className=&quot;flex flex-col space-y-6&quot;>
        {/* Back button and header */}
        <div className=&quot;flex items-center space-x-4&quot;>
          <Button
            variant=&quot;ghost&quot;
            size=&quot;sm&quot;
            onClick={() => router.push(&quot;/admin/alerts&quot;)}
            className=&quot;flex items-center space-x-1&quot;
          >
            <ChevronLeft className=&quot;h-4 w-4&quot; />
            <span>Back to Alerts</span>
          </Button>
        </div>

        {/* Alert header */}
        <div className=&quot;flex justify-between items-start&quot;>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight flex items-center&quot;>
              <span className=&quot;mr-3&quot;>{alert.title}</span>
              {getStatusBadge(alert.status)}
            </h1>
            <div className=&quot;flex items-center space-x-4 mt-2 text-muted-foreground&quot;>
              <div className=&quot;flex items-center&quot;>
                <Clock className=&quot;h-4 w-4 mr-1&quot; />
                <span>{format(alert.createdAt, &quot;MMM d, h:mm a&quot;)}</span>
              </div>
              <div className=&quot;flex items-center&quot;>
                <Tag className=&quot;h-4 w-4 mr-1&quot; />
                <span className=&quot;capitalize&quot;>{alert.category}</span>
              </div>
              <div className=&quot;flex items-center&quot;>
                <User className=&quot;h-4 w-4 mr-1&quot; />
                <span>{alert.assignedTo || &quot;Unassigned&quot;}</span>
              </div>
            </div>
          </div>

          <div className=&quot;flex items-center space-x-2&quot;>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <CircleCheck className=&quot;h-4 w-4 mr-2&quot; />
              Mark as Resolved
            </Button>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
              Assign
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant=&quot;ghost&quot; size=&quot;icon&quot;>
                  <MoreHorizontal className=&quot;h-4 w-4&quot; />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align=&quot;end&quot;>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Bell className=&quot;h-4 w-4 mr-2&quot; />
                  <span>Subscribe to Updates</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellOff className=&quot;h-4 w-4 mr-2&quot; />
                  <span>Silence Alert</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share className=&quot;h-4 w-4 mr-2&quot; />
                  <span>Share Alert</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content */}
        <div className=&quot;grid grid-cols-3 gap-6&quot;>
          {/* Left column - Alert details */}
          <div className=&quot;col-span-2 space-y-6&quot;>
            <Card>
              <CardHeader>
                <CardTitle>Alert Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className=&quot;text-muted-foreground&quot;>{alert.description}</p>

                <div className=&quot;mt-6&quot;>
                  <h3 className=&quot;font-medium mb-2&quot;>Affected Metrics</h3>
                  <div className=&quot;grid grid-cols-3 gap-4&quot;>
                    {alert.metrics.map((metric, index) => (
                      <div key={index} className=&quot;p-3 border rounded-md&quot;>
                        <div className=&quot;text-sm text-muted-foreground&quot;>
                          {metric.name}
                        </div>
                        <div className=&quot;flex justify-between items-center mt-1&quot;>
                          <div className=&quot;text-xl font-semibold&quot;>
                            {metric.value}
                          </div>
                          <div
                            className={`text-sm ${
                              metric.status === &quot;negative&quot;
                                ? &quot;text-red-500&quot;
                                : metric.status === &quot;warning&quot;
                                  ? &quot;text-amber-500&quot;
                                  : &quot;text-green-500&quot;
                            }`}
                          >
                            {metric.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue=&quot;activity&quot;>
              <TabsList>
                <TabsTrigger value=&quot;activity&quot;>Activity</TabsTrigger>
                <TabsTrigger value=&quot;discussion&quot;>Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value=&quot;activity&quot; className=&quot;space-y-4&quot;>
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                    <CardDescription>
                      Recent activity for this alert
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;space-y-4&quot;>
                      {alert.activity.map((activity, index) => (
                        <div key={index} className=&quot;flex&quot;>
                          <div className=&quot;mr-4 flex flex-col items-center&quot;>
                            <div className=&quot;bg-muted-foreground/20 p-2 rounded-full&quot;>
                              {activity.type === &quot;alert_created&quot; ? (
                                <BadgeAlert className=&quot;h-4 w-4 text-amber-500&quot; />
                              ) : (
                                <CalendarClock className=&quot;h-4 w-4 text-blue-500&quot; />
                              )}
                            </div>
                            {index !== alert.activity.length - 1 && (
                              <div className=&quot;h-full w-px bg-muted my-1&quot; />
                            )}
                          </div>
                          <div>
                            <div className=&quot;flex items-baseline&quot;>
                              <span className=&quot;font-medium&quot;>
                                {activity.user.name}
                              </span>
                              <span className=&quot;text-muted-foreground text-sm ml-2&quot;>
                                {format(activity.timestamp, &quot;MMM d, h:mm a&quot;)}
                              </span>
                            </div>
                            <p className=&quot;text-sm mt-1&quot;>{activity.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value=&quot;discussion&quot;>
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                    <CardDescription>
                      Discuss this alert with your team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;space-y-4&quot;>
                      <div className=&quot;flex items-start space-x-4&quot;>
                        <Avatar className=&quot;h-8 w-8&quot;>
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className=&quot;flex-1&quot;>
                          <Textarea
                            placeholder=&quot;Add a comment...&quot;
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className=&quot;resize-none&quot;
                          />
                          <div className=&quot;flex justify-end mt-2&quot;>
                            <Button size=&quot;sm&quot; onClick={handleAddComment}>
                              <MessageSquare className=&quot;h-4 w-4 mr-2&quot; />
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className=&quot;text-center py-6 text-muted-foreground&quot;>
                        <MessageSquare className=&quot;h-6 w-6 mx-auto mb-2&quot; />
                        <p>No comments yet</p>
                        <p className=&quot;text-sm&quot;>
                          Be the first to comment on this alert
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Related info */}
          <div className=&quot;space-y-6&quot;>
            <Card>
              <CardHeader>
                <CardTitle>Alert Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-2&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Status</span>
                    <span className=&quot;font-medium capitalize&quot;>
                      {alert.status}
                    </span>
                  </div>
                  <Separator />
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Created</span>
                    <span className=&quot;font-medium&quot;>
                      {format(alert.createdAt, &quot;MMM d, h:mm a&quot;)}
                    </span>
                  </div>
                  <Separator />
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Time Open</span>
                    <span className=&quot;font-medium&quot;>15 minutes</span>
                  </div>
                  <Separator />
                  <div className=&quot;flex justify-between&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Assigned To</span>
                    <span className=&quot;font-medium&quot;>
                      {alert.assignedTo || &quot;Unassigned&quot;}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;flex justify-between items-center&quot;>
                    <span className=&quot;text-muted-foreground&quot;>Team Members</span>
                    <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                      <Users className=&quot;h-4 w-4 mr-2&quot; />
                      Add Member
                    </Button>
                  </div>
                  <div className=&quot;text-center py-6 text-muted-foreground&quot;>
                    <Users className=&quot;h-6 w-6 mx-auto mb-2&quot; />
                    <p>No team members assigned</p>
                    <p className=&quot;text-sm&quot;>
                      Assign team members to collaborate on this alert
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Similar Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-2&quot;>
                  <Link
                    href=&quot;/admin/alerts/2&quot;
                    className=&quot;block p-3 rounded-md border hover:bg-muted&quot;
                  >
                    <div className=&quot;flex items-center&quot;>
                      <BadgeAlert className=&quot;h-4 w-4 text-red-500 mr-2&quot; />
                      <span className=&quot;font-medium&quot;>API Rate Limiting</span>
                    </div>
                    <p className=&quot;text-sm text-muted-foreground mt-1">
                      Rate limit threshold reached for external API calls
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
