&quot;use client&quot;;

import { useState, use } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Clock,
  Bell,
  CheckSquare,
  Calendar,
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
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import Link from &quot;next/link&quot;;

interface MessageTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

// Message templates
const messageTemplates = [
  {
    id: &quot;welcome&quot;,
    name: &quot;Welcome Message&quot;,
    subject: &quot;Welcome to the Team!&quot;,
    body: &quot;Hi {name},\n\nWelcome to our team! We're excited to have you on board. Please let me know if you have any questions about your upcoming assignments.\n\nBest regards,\nYour Manager&quot;,
  },
  {
    id: &quot;assignment&quot;,
    name: &quot;New Assignment&quot;,
    subject: &quot;New Event Assignment - {eventName}&quot;,
    body: &quot;Hi {name},\n\nYou have been assigned to a new event: {eventName}\n\nEvent Details:\n- Date: {eventDate}\n- Location: {eventLocation}\n- Compensation: {compensation}\n\nPlease confirm your availability by replying to this message.\n\nThanks!&quot;,
  },
  {
    id: &quot;reminder&quot;,
    name: &quot;Event Reminder&quot;,
    subject: &quot;Reminder: Upcoming Event - {eventName}&quot;,
    body: &quot;Hi {name},\n\nThis is a friendly reminder about your upcoming event:\n\n{eventName}\nDate: {eventDate}\nTime: {eventTime}\nLocation: {eventLocation}\n\nPlease arrive 15 minutes early and bring all required materials.\n\nSee you there!&quot;,
  },
  {
    id: &quot;performance&quot;,
    name: &quot;Performance Feedback&quot;,
    subject: &quot;Performance Review - Great Work!&quot;,
    body: &quot;Hi {name},\n\nI wanted to take a moment to acknowledge your excellent performance on recent events. Your professionalism and attention to detail have been outstanding.\n\nKeep up the great work!\n\nBest regards&quot;,
  },
  {
    id: &quot;custom&quot;,
    name: &quot;Custom Message&quot;,
    subject: "&quot;,
    body: &quot;&quot;,
  },
];

// Mock team member data
const getTeamMemberById = (id: string) => {
  const members = {
    &quot;1&quot;: { id: &quot;1&quot;, name: &quot;Sarah Johnson&quot;, email: &quot;sarah.johnson@example.com&quot; },
    &quot;2&quot;: { id: &quot;2&quot;, name: &quot;Michael Chen&quot;, email: &quot;michael.chen@example.com&quot; },
    &quot;3&quot;: { id: &quot;3&quot;, name: &quot;Emily Davis&quot;, email: &quot;emily.davis@example.com&quot; },
    &quot;4&quot;: { id: &quot;4&quot;, name: &quot;David Wilson&quot;, email: &quot;david.wilson@example.com&quot; },
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
    template: &quot;&quot;,
    subject: &quot;&quot;,
    body: &quot;&quot;,
    priority: &quot;normal&quot;,
    deliveryMethod: &quot;email&quot;,
    scheduleDelivery: false,
    scheduleDate: &quot;&quot;,
    scheduleTime: &quot;&quot;,
    requiresResponse: false,
    createTask: false,
    taskTitle: &quot;&quot;,
    taskDueDate: &quot;&quot;,
  });

  const [isSending, setIsSending] = useState(false);

  if (!member) {
    return (
      <div className=&quot;container mx-auto p-6&quot;>
        <div className=&quot;text-center&quot;>
          <h1 className=&quot;text-2xl font-bold text-muted-foreground&quot;>
            Team Member Not Found
          </h1>
          <Link href=&quot;/team&quot;>
            <Button variant=&quot;outline&quot; className=&quot;mt-4&quot;>
              <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
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
        subject: template.subject.replace(&quot;{name}&quot;, member.name),
        body: template.body.replace(&quot;{name}&quot;, member.name),
      }));
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setMessageData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendMessage = async () => {
    if (!messageData.subject.trim() || !messageData.body.trim()) {
      toast({
        title: &quot;Incomplete Message&quot;,
        description: &quot;Please provide both subject and message content.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsSending(true);

    try {
      // Send message
      const messageResponse = await fetch(&quot;/api/messages/send&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
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
          sentBy: &quot;current-user-id&quot;,
        }),
      });

      if (!messageResponse.ok) {
        throw new Error(&quot;Failed to send message&quot;);
      }

      // Create task if requested
      if (messageData.createTask && messageData.taskTitle.trim()) {
        await fetch(&quot;/api/tasks&quot;, {
          method: &quot;POST&quot;,
          headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
          body: JSON.stringify({
            title: messageData.taskTitle,
            description: `Follow up on message: ${messageData.subject}`,
            type: &quot;follow_up&quot;,
            assignedTo: id,
            assignedBy: &quot;current-user-id&quot;,
            dueDate: messageData.taskDueDate,
            priority: messageData.priority,
            status: &quot;assigned&quot;,
          }),
        });
      }

      // Publish message sent event
      await fetch(&quot;/api/events/publish&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          eventType: &quot;team.message.sent&quot;,
          payload: {
            recipientId: id,
            recipientName: member.name,
            subject: messageData.subject,
            priority: messageData.priority,
            deliveryMethod: messageData.deliveryMethod,
            requiresResponse: messageData.requiresResponse,
            sentBy: &quot;current-user-id&quot;,
            organizationId: &quot;current-org-id&quot;,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: &quot;Message Sent&quot;,
        description: `Your message has been sent to ${member.name}.`,
      });

      router.push(`/team/${id}`);
    } catch (error) {
      toast({
        title: &quot;Send Failed&quot;,
        description: &quot;There was an error sending your message.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex items-center justify-between&quot;>
        <div className=&quot;flex items-center space-x-4&quot;>
          <Link href={`/team/${id}`}>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className=&quot;text-3xl font-bold&quot;>Send Message</h1>
            <p className=&quot;text-muted-foreground&quot;>
              Send a message to {member.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSendMessage} disabled={isSending}>
          <Send className=&quot;h-4 w-4 mr-2&quot; />
          {isSending ? &quot;Sending...&quot; : &quot;Send Message&quot;}
        </Button>
      </div>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
        {/* Message Composition */}
        <div className=&quot;lg:col-span-2 space-y-6&quot;>
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <MessageSquare className=&quot;h-5 w-5 mr-2&quot; />
                Message Template
              </CardTitle>
              <CardDescription>
                Choose a template or create a custom message
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;template&quot;>Template</Label>
                <Select
                  value={messageData.template}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;Select a template&quot; />
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
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;subject&quot;>Subject</Label>
                <Input
                  id=&quot;subject&quot;
                  value={messageData.subject}
                  onChange={(e) => handleInputChange(&quot;subject&quot;, e.target.value)}
                  placeholder=&quot;Enter message subject&quot;
                />
              </div>
              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;body&quot;>Message</Label>
                <Textarea
                  id=&quot;body&quot;
                  value={messageData.body}
                  onChange={(e) => handleInputChange(&quot;body&quot;, e.target.value)}
                  placeholder=&quot;Enter your message&quot;
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <Clock className=&quot;h-5 w-5 mr-2&quot; />
                Delivery Options
              </CardTitle>
              <CardDescription>
                Configure message delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;priority&quot;>Priority</Label>
                  <Select
                    value={messageData.priority}
                    onValueChange={(value) =>
                      handleInputChange(&quot;priority&quot;, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select priority&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;low&quot;>Low</SelectItem>
                      <SelectItem value=&quot;normal&quot;>Normal</SelectItem>
                      <SelectItem value=&quot;high&quot;>High</SelectItem>
                      <SelectItem value=&quot;urgent&quot;>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;deliveryMethod&quot;>Delivery Method</Label>
                  <Select
                    value={messageData.deliveryMethod}
                    onValueChange={(value) =>
                      handleInputChange(&quot;deliveryMethod&quot;, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select method&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;email&quot;>Email</SelectItem>
                      <SelectItem value=&quot;sms&quot;>SMS</SelectItem>
                      <SelectItem value=&quot;app&quot;>In-App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;scheduleDelivery&quot;
                  checked={messageData.scheduleDelivery}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;scheduleDelivery&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;scheduleDelivery&quot;>Schedule delivery</Label>
              </div>

              {messageData.scheduleDelivery && (
                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;scheduleDate&quot;>Date</Label>
                    <Input
                      id=&quot;scheduleDate&quot;
                      type=&quot;date&quot;
                      value={messageData.scheduleDate}
                      onChange={(e) =>
                        handleInputChange(&quot;scheduleDate&quot;, e.target.value)
                      }
                    />
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;scheduleTime&quot;>Time</Label>
                    <Input
                      id=&quot;scheduleTime&quot;
                      type=&quot;time&quot;
                      value={messageData.scheduleTime}
                      onChange={(e) =>
                        handleInputChange(&quot;scheduleTime&quot;, e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;requiresResponse&quot;
                  checked={messageData.requiresResponse}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;requiresResponse&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;requiresResponse&quot;>Requires response</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className=&quot;space-y-6&quot;>
          {/* Recipient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;flex items-center space-x-3&quot;>
                <Avatar>
                  <AvatarImage
                    src={`/avatars/${member.name.toLowerCase().replace(&quot; &quot;, &quot;-&quot;)}.jpg`}
                  />
                  <AvatarFallback>
                    {member.name
                      .split(&quot; &quot;)
                      .map((n) => n[0])
                      .join(&quot;&quot;)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className=&quot;font-medium&quot;>{member.name}</p>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    {member.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Task */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <CheckSquare className=&quot;h-5 w-5 mr-2&quot; />
                Follow-up Task
              </CardTitle>
              <CardDescription>
                Create a task to follow up on this message
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;createTask&quot;
                  checked={messageData.createTask}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;createTask&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;createTask&quot;>Create follow-up task</Label>
              </div>

              {messageData.createTask && (
                <>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;taskTitle&quot;>Task Title</Label>
                    <Input
                      id=&quot;taskTitle&quot;
                      value={messageData.taskTitle}
                      onChange={(e) =>
                        handleInputChange(&quot;taskTitle&quot;, e.target.value)
                      }
                      placeholder=&quot;Enter task title&quot;
                    />
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;taskDueDate&quot;>Due Date</Label>
                    <Input
                      id=&quot;taskDueDate&quot;
                      type=&quot;date&quot;
                      value={messageData.taskDueDate}
                      onChange={(e) =>
                        handleInputChange(&quot;taskDueDate&quot;, e.target.value)
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
              <div className=&quot;space-y-3&quot;>
                <div className=&quot;text-sm space-y-1&quot;>
                  <p className=&quot;font-medium&quot;>Event Assignment Confirmation</p>
                  <p className=&quot;text-muted-foreground&quot;>2 days ago</p>
                </div>
                <div className=&quot;text-sm space-y-1&quot;>
                  <p className=&quot;font-medium&quot;>Welcome Message</p>
                  <p className=&quot;text-muted-foreground&quot;>1 week ago</p>
                </div>
                <div className=&quot;text-sm space-y-1&quot;>
                  <p className=&quot;font-medium&quot;>Performance Feedback</p>
                  <p className=&quot;text-muted-foreground">2 weeks ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
