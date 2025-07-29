"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Clock,
  Bell,
  CheckSquare,
  Calendar,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface MessageTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

// Message templates
const messageTemplates = [
  {
    id: "welcome",
    name: "Welcome Message",
    subject: "Welcome to the Team!",
    body: "Hi {name},\n\nWelcome to our team! We're excited to have you on board. Please let me know if you have any questions about your upcoming assignments.\n\nBest regards,\nYour Manager",
  },
  {
    id: "assignment",
    name: "New Assignment",
    subject: "New Event Assignment - {eventName}",
    body: "Hi {name},\n\nYou have been assigned to a new event: {eventName}\n\nEvent Details:\n- Date: {eventDate}\n- Location: {eventLocation}\n- Compensation: {compensation}\n\nPlease confirm your availability by replying to this message.\n\nThanks!",
  },
  {
    id: "reminder",
    name: "Event Reminder",
    subject: "Reminder: Upcoming Event - {eventName}",
    body: "Hi {name},\n\nThis is a friendly reminder about your upcoming event:\n\n{eventName}\nDate: {eventDate}\nTime: {eventTime}\nLocation: {eventLocation}\n\nPlease arrive 15 minutes early and bring all required materials.\n\nSee you there!",
  },
  {
    id: "performance",
    name: "Performance Feedback",
    subject: "Performance Review - Great Work!",
    body: "Hi {name},\n\nI wanted to take a moment to acknowledge your excellent performance on recent events. Your professionalism and attention to detail have been outstanding.\n\nKeep up the great work!\n\nBest regards",
  },
  {
    id: "custom",
    name: "Custom Message",
    subject: "",
    body: "",
  },
];

// Mock team member data
const getTeamMemberById = (id: string) => {
  const members = {
    "1": { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    "2": { id: "2", name: "Michael Chen", email: "michael.chen@example.com" },
    "3": { id: "3", name: "Emily Davis", email: "emily.davis@example.com" },
    "4": { id: "4", name: "David Wilson", email: "david.wilson@example.com" },
  };
  return members[id as keyof typeof members] || null;
};

export default function MessageTeamMemberPage({
  params,
}: MessageTeamMemberProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const member = getTeamMemberById(id);

  const [messageData, setMessageData] = useState({
    template: "",
    subject: "",
    body: "",
    priority: "normal",
    deliveryMethod: "email",
    scheduleDelivery: false,
    scheduleDate: "",
    scheduleTime: "",
    requiresResponse: false,
    createTask: false,
    taskTitle: "",
    taskDueDate: "",
  });

  const [isSending, setIsSending] = useState(false);

  if (!member) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Team Member Not Found
          </h1>
          <Link href="/team">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleTemplateChange = (templateId: string) => {
    const template = messageTemplates.find((t) => t.id === templateId);
    if (template) {
      setMessageData((prev) => ({
        ...prev,
        template: templateId,
        subject: template.subject.replace("{name}", member.name),
        body: template.body.replace("{name}", member.name),
      }));
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setMessageData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendMessage = async () => {
    if (!messageData.subject.trim() || !messageData.body.trim()) {
      toast({
        title: "Incomplete Message",
        description: "Please provide both subject and message content.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Send message
      const messageResponse = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: id,
          recipientEmail: member.email,
          subject: messageData.subject,
          body: messageData.body,
          priority: messageData.priority,
          deliveryMethod: messageData.deliveryMethod,
          scheduleDelivery: messageData.scheduleDelivery,
          scheduleDate: messageData.scheduleDate,
          scheduleTime: messageData.scheduleTime,
          requiresResponse: messageData.requiresResponse,
          sentBy: "current-user-id",
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to send message");
      }

      // Create task if requested
      if (messageData.createTask && messageData.taskTitle.trim()) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: messageData.taskTitle,
            description: `Follow up on message: ${messageData.subject}`,
            type: "follow_up",
            assignedTo: id,
            assignedBy: "current-user-id",
            dueDate: messageData.taskDueDate,
            priority: messageData.priority,
            status: "assigned",
          }),
        });
      }

      // Publish message sent event
      await fetch("/api/events/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "team.message.sent",
          payload: {
            recipientId: id,
            recipientName: member.name,
            subject: messageData.subject,
            priority: messageData.priority,
            deliveryMethod: messageData.deliveryMethod,
            requiresResponse: messageData.requiresResponse,
            sentBy: "current-user-id",
            organizationId: "current-org-id",
          },
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${member.name}.`,
      });

      router.push(`/team/${id}`);
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "There was an error sending your message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/team/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Send Message</h1>
            <p className="text-muted-foreground">
              Send a message to {member.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSendMessage} disabled={isSending}>
          <Send className="h-4 w-4 mr-2" />
          {isSending ? "Sending..." : "Send Message"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Message Template
              </CardTitle>
              <CardDescription>
                Choose a template or create a custom message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={messageData.template}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>Compose your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={messageData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Enter message subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={messageData.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  placeholder="Enter your message"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Delivery Options
              </CardTitle>
              <CardDescription>
                Configure message delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={messageData.priority}
                    onValueChange={(value) =>
                      handleInputChange("priority", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryMethod">Delivery Method</Label>
                  <Select
                    value={messageData.deliveryMethod}
                    onValueChange={(value) =>
                      handleInputChange("deliveryMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="app">In-App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scheduleDelivery"
                  checked={messageData.scheduleDelivery}
                  onCheckedChange={(checked) =>
                    handleInputChange("scheduleDelivery", checked as boolean)
                  }
                />
                <Label htmlFor="scheduleDelivery">Schedule delivery</Label>
              </div>

              {messageData.scheduleDelivery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleDate">Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={messageData.scheduleDate}
                      onChange={(e) =>
                        handleInputChange("scheduleDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduleTime">Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={messageData.scheduleTime}
                      onChange={(e) =>
                        handleInputChange("scheduleTime", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresResponse"
                  checked={messageData.requiresResponse}
                  onCheckedChange={(checked) =>
                    handleInputChange("requiresResponse", checked as boolean)
                  }
                />
                <Label htmlFor="requiresResponse">Requires response</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recipient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={`/avatars/${member.name.toLowerCase().replace(" ", "-")}.jpg`}
                  />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Task */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Follow-up Task
              </CardTitle>
              <CardDescription>
                Create a task to follow up on this message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createTask"
                  checked={messageData.createTask}
                  onCheckedChange={(checked) =>
                    handleInputChange("createTask", checked as boolean)
                  }
                />
                <Label htmlFor="createTask">Create follow-up task</Label>
              </div>

              {messageData.createTask && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle">Task Title</Label>
                    <Input
                      id="taskTitle"
                      value={messageData.taskTitle}
                      onChange={(e) =>
                        handleInputChange("taskTitle", e.target.value)
                      }
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDueDate">Due Date</Label>
                    <Input
                      id="taskDueDate"
                      type="date"
                      value={messageData.taskDueDate}
                      onChange={(e) =>
                        handleInputChange("taskDueDate", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Previous communications with {member.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="font-medium">Event Assignment Confirmation</p>
                  <p className="text-muted-foreground">2 days ago</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Welcome Message</p>
                  <p className="text-muted-foreground">1 week ago</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Performance Feedback</p>
                  <p className="text-muted-foreground">2 weeks ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
