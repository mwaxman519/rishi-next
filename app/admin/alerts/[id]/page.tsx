"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock alert data
const alertsData = [
  {
    id: 1,
    title: "Database Performance",
    description:
      "Slow query performance detected in production environment on the main database cluster. Multiple queries taking over 5 seconds to complete.",
    status: "critical",
    category: "system",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
    metrics: [
      {
        name: "Query Response Time",
        value: "5.2s",
        change: "+220%",
        status: "negative",
      },
      { name: "CPU Usage", value: "92%", change: "+45%", status: "negative" },
      {
        name: "Connection Count",
        value: "128",
        change: "+30%",
        status: "warning",
      },
    ],
    activity: [
      {
        type: "alert_created",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: { id: 1, name: "System" },
        message: "Alert created due to slow query performance",
      },
      {
        type: "metric_change",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        user: { id: 1, name: "System" },
        message: "Query response time increased to 5.5s",
      },
    ],
  },
  {
    id: 2,
    title: "API Rate Limiting",
    description:
      "Rate limit threshold reached for external API calls. This may impact third-party service integrations.",
    status: "critical",
    category: "api",
    createdAt: new Date(Date.now() - 42 * 60 * 1000),
    resolvedAt: null,
    assignedTo: null,
    metrics: [
      {
        name: "API Requests/Min",
        value: "450",
        change: "+180%",
        status: "negative",
      },
      {
        name: "Error Rate",
        value: "15%",
        change: "+1200%",
        status: "negative",
      },
      {
        name: "Response Time",
        value: "2.8s",
        change: "+340%",
        status: "negative",
      },
    ],
    activity: [
      {
        type: "alert_created",
        timestamp: new Date(Date.now() - 42 * 60 * 1000),
        user: { id: 1, name: "System" },
        message: "Alert created due to API rate limit threshold reached",
      },
    ],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "critical":
      return (
        <Badge variant="destructive" className="rounded-sm px-2 py-1">
          Critical
        </Badge>
      );
    case "warning":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 rounded-sm px-2 py-1"
        >
          Warning
        </Badge>
      );
    case "info":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 rounded-sm px-2 py-1"
        >
          Info
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="rounded-sm px-2 py-1">
          {status}
        </Badge>
      );
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "critical":
      return <BadgeAlert className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const id = typeof params.id === "string" ? parseInt(params.id, 10) : 1;

  // Find the alert by ID
  const alert = alertsData.find((a) => a.id === id) || alertsData[0];
  
  // Handle case where no alert is found
  if (!alert) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Alert Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested alert could not be found.</p>
          <Button 
            onClick={() => router.push("/admin/alerts")}
            className="mt-4"
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
    console.log("Adding comment:", newComment);

    // Clear the input
    setNewComment("");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Back button and header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/alerts")}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Alerts</span>
          </Button>
        </div>

        {/* Alert header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <span className="mr-3">{alert.title}</span>
              {getStatusBadge(alert.status)}
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{format(alert.createdAt, "MMM d, h:mm a")}</span>
              </div>
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <span className="capitalize">{alert.category}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{alert.assignedTo || "Unassigned"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <CircleCheck className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Subscribe to Updates</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellOff className="h-4 w-4 mr-2" />
                  <span>Silence Alert</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  <span>Share Alert</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left column - Alert details */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{alert.description}</p>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Affected Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {alert.metrics.map((metric, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="text-sm text-muted-foreground">
                          {metric.name}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xl font-semibold">
                            {metric.value}
                          </div>
                          <div
                            className={`text-sm ${
                              metric.status === "negative"
                                ? "text-red-500"
                                : metric.status === "warning"
                                  ? "text-amber-500"
                                  : "text-green-500"
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

            <Tabs defaultValue="activity">
              <TabsList>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                    <CardDescription>
                      Recent activity for this alert
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alert.activity.map((activity, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4 flex flex-col items-center">
                            <div className="bg-muted-foreground/20 p-2 rounded-full">
                              {activity.type === "alert_created" ? (
                                <BadgeAlert className="h-4 w-4 text-amber-500" />
                              ) : (
                                <CalendarClock className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            {index !== alert.activity.length - 1 && (
                              <div className="h-full w-px bg-muted my-1" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-baseline">
                              <span className="font-medium">
                                {activity.user.name}
                              </span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {format(activity.timestamp, "MMM d, h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{activity.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion">
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                    <CardDescription>
                      Discuss this alert with your team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={handleAddComment}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                        <p>No comments yet</p>
                        <p className="text-sm">
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">
                      {alert.status}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {format(alert.createdAt, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Open</span>
                    <span className="font-medium">15 minutes</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned To</span>
                    <span className="font-medium">
                      {alert.assignedTo || "Unassigned"}
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Team Members</span>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-6 w-6 mx-auto mb-2" />
                    <p>No team members assigned</p>
                    <p className="text-sm">
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
                <div className="space-y-2">
                  <Link
                    href="/admin/alerts/2"
                    className="block p-3 rounded-md border hover:bg-muted"
                  >
                    <div className="flex items-center">
                      <BadgeAlert className="h-4 w-4 text-red-500 mr-2" />
                      <span className="font-medium">API Rate Limiting</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
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
