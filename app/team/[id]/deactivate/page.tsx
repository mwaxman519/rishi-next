&quot;use client&quot;;

import { useState, use } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { ArrowLeft, AlertTriangle, UserX, Clock, FileText } from &quot;lucide-react&quot;;
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
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import Link from &quot;next/link&quot;;

interface DeactivateTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock team member data
const getTeamMemberById = (id: string) => {
  const members = {
    &quot;1&quot;: {
      id: &quot;1&quot;,
      name: &quot;Sarah Johnson&quot;,
      email: &quot;sarah.johnson@example.com&quot;,
      role: &quot;Brand Agent&quot;,
      status: &quot;active&quot;,
      upcomingEvents: 3,
      activeAssignments: 2,
    },
    &quot;2&quot;: {
      id: &quot;2&quot;,
      name: &quot;Michael Chen&quot;,
      email: &quot;michael.chen@example.com&quot;,
      role: &quot;Brand Agent&quot;,
      status: &quot;active&quot;,
      upcomingEvents: 1,
      activeAssignments: 1,
    },
    &quot;3&quot;: {
      id: &quot;3&quot;,
      name: &quot;Emily Davis&quot;,
      email: &quot;emily.davis@example.com&quot;,
      role: &quot;Field Manager&quot;,
      status: &quot;active&quot;,
      upcomingEvents: 0,
      activeAssignments: 0,
    },
    &quot;4&quot;: {
      id: &quot;4&quot;,
      name: &quot;David Wilson&quot;,
      email: &quot;david.wilson@example.com&quot;,
      role: &quot;Brand Agent&quot;,
      status: &quot;active&quot;,
      upcomingEvents: 2,
      activeAssignments: 1,
    },
  };
  return members[id as keyof typeof members] || null;
};

export default function DeactivateTeamMemberPage({
  params,
}: DeactivateTeamMemberProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const member = getTeamMemberById(id);

  const [deactivationData, setDeactivationData] = useState({
    reason: "&quot;,
    customReason: &quot;&quot;,
    effectiveDate: new Date().toISOString().split(&quot;T&quot;)[0],
    notifyMember: true,
    transferAssignments: true,
    transferTo: &quot;&quot;,
    finalPayroll: true,
    returnEquipment: false,
    notes: &quot;&quot;,
    confirmDeactivation: false,
  });

  const [isDeactivating, setIsDeactivating] = useState(false);

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setDeactivationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeactivate = async () => {
    if (!deactivationData.reason) {
      toast({
        title: &quot;Reason Required&quot;,
        description: &quot;Please select a reason for deactivation.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    if (
      deactivationData.reason === &quot;other&quot; &&
      !deactivationData.customReason.trim()
    ) {
      toast({
        title: &quot;Custom Reason Required&quot;,
        description: &quot;Please provide a custom reason for deactivation.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    if (!deactivationData.confirmDeactivation) {
      toast({
        title: &quot;Confirmation Required&quot;,
        description:
          &quot;Please confirm that you want to deactivate this team member.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsDeactivating(true);

    try {
      // Deactivate team member
      const deactivateResponse = await fetch(`/api/team/${id}/deactivate`, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          reason:
            deactivationData.reason === &quot;other&quot;
              ? deactivationData.customReason
              : deactivationData.reason,
          effectiveDate: deactivationData.effectiveDate,
          transferAssignments: deactivationData.transferAssignments,
          transferTo: deactivationData.transferTo,
          notes: deactivationData.notes,
          deactivatedBy: &quot;current-user-id&quot;,
        }),
      });

      if (!deactivateResponse.ok) {
        throw new Error(&quot;Failed to deactivate team member&quot;);
      }

      // Send notification to member if requested
      if (deactivationData.notifyMember) {
        await fetch(&quot;/api/messages/send&quot;, {
          method: &quot;POST&quot;,
          headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
          body: JSON.stringify({
            recipientId: id,
            recipientEmail: member.email,
            subject: &quot;Account Deactivation Notice&quot;,
            body: `Dear ${member.name},\n\nThis is to inform you that your account will be deactivated effective ${deactivationData.effectiveDate}.\n\nReason: ${deactivationData.reason === &quot;other&quot; ? deactivationData.customReason : deactivationData.reason}\n\nIf you have any questions, please contact your manager.\n\nBest regards,\nHR Team`,
            priority: &quot;high&quot;,
            deliveryMethod: &quot;email&quot;,
            sentBy: &quot;current-user-id&quot;,
          }),
        });
      }

      // Create final payroll task if needed
      if (deactivationData.finalPayroll) {
        await fetch(&quot;/api/tasks&quot;, {
          method: &quot;POST&quot;,
          headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
          body: JSON.stringify({
            title: `Process Final Payroll - ${member.name}`,
            description: `Process final payroll for deactivated team member: ${member.name}`,
            type: &quot;payroll_processing&quot;,
            assignedTo: &quot;hr-admin-id&quot;,
            assignedBy: &quot;current-user-id&quot;,
            dueDate: deactivationData.effectiveDate,
            priority: &quot;high&quot;,
            status: &quot;assigned&quot;,
          }),
        });
      }

      // Create equipment return task if needed
      if (deactivationData.returnEquipment) {
        await fetch(&quot;/api/tasks&quot;, {
          method: &quot;POST&quot;,
          headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
          body: JSON.stringify({
            title: `Equipment Return - ${member.name}`,
            description: `Collect equipment from deactivated team member: ${member.name}`,
            type: &quot;equipment_return&quot;,
            assignedTo: &quot;it-admin-id&quot;,
            assignedBy: &quot;current-user-id&quot;,
            dueDate: deactivationData.effectiveDate,
            priority: &quot;normal&quot;,
            status: &quot;assigned&quot;,
          }),
        });
      }

      // Publish deactivation event
      await fetch(&quot;/api/events/publish&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          eventType: &quot;team.member.deactivated&quot;,
          payload: {
            memberId: id,
            memberName: member.name,
            reason:
              deactivationData.reason === &quot;other&quot;
                ? deactivationData.customReason
                : deactivationData.reason,
            effectiveDate: deactivationData.effectiveDate,
            transferAssignments: deactivationData.transferAssignments,
            transferTo: deactivationData.transferTo,
            deactivatedBy: &quot;current-user-id&quot;,
            organizationId: &quot;current-org-id&quot;,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: &quot;Team Member Deactivated&quot;,
        description: `${member.name} has been successfully deactivated.`,
      });

      router.push(&quot;/team&quot;);
    } catch (error) {
      toast({
        title: &quot;Deactivation Failed&quot;,
        description: &quot;There was an error deactivating the team member.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const reasonOptions = [
    { value: &quot;resignation&quot;, label: &quot;Resignation&quot; },
    { value: &quot;termination&quot;, label: &quot;Termination&quot; },
    { value: &quot;layoff&quot;, label: &quot;Layoff&quot; },
    { value: &quot;retirement&quot;, label: &quot;Retirement&quot; },
    { value: &quot;contract_end&quot;, label: &quot;Contract End&quot; },
    { value: &quot;performance&quot;, label: &quot;Performance Issues&quot; },
    { value: &quot;misconduct&quot;, label: &quot;Misconduct&quot; },
    { value: &quot;other&quot;, label: &quot;Other&quot; },
  ];

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
            <h1 className=&quot;text-3xl font-bold&quot;>Deactivate Team Member</h1>
            <p className=&quot;text-muted-foreground&quot;>
              Deactivate {member.name}'s account
            </p>
          </div>
        </div>
        <Button
          onClick={handleDeactivate}
          disabled={isDeactivating}
          variant=&quot;destructive&quot;
        >
          <UserX className=&quot;h-4 w-4 mr-2&quot; />
          {isDeactivating ? &quot;Deactivating...&quot; : &quot;Deactivate Member&quot;}
        </Button>
      </div>

      {/* Warning Alert */}
      <Alert variant=&quot;destructive&quot;>
        <AlertTriangle className=&quot;h-4 w-4&quot; />
        <AlertTitle>Warning: This action cannot be undone</AlertTitle>
        <AlertDescription>
          Deactivating this team member will remove their access to the system
          and may affect ongoing assignments and events.
        </AlertDescription>
      </Alert>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
        {/* Deactivation Details */}
        <div className=&quot;lg:col-span-2 space-y-6&quot;>
          {/* Reason for Deactivation */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <FileText className=&quot;h-5 w-5 mr-2&quot; />
                Reason for Deactivation
              </CardTitle>
              <CardDescription>
                Provide the reason for deactivating this team member
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;reason&quot;>Reason</Label>
                <Select
                  value={deactivationData.reason}
                  onValueChange={(value) => handleInputChange(&quot;reason&quot;, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&quot;Select a reason&quot; />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {deactivationData.reason === &quot;other&quot; && (
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;customReason&quot;>Custom Reason</Label>
                  <Input
                    id=&quot;customReason&quot;
                    value={deactivationData.customReason}
                    onChange={(e) =>
                      handleInputChange(&quot;customReason&quot;, e.target.value)
                    }
                    placeholder=&quot;Please specify the reason&quot;
                  />
                </div>
              )}

              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;effectiveDate&quot;>Effective Date</Label>
                <Input
                  id=&quot;effectiveDate&quot;
                  type=&quot;date&quot;
                  value={deactivationData.effectiveDate}
                  onChange={(e) =>
                    handleInputChange(&quot;effectiveDate&quot;, e.target.value)
                  }
                />
              </div>

              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;notes&quot;>Additional Notes</Label>
                <Textarea
                  id=&quot;notes&quot;
                  value={deactivationData.notes}
                  onChange={(e) => handleInputChange(&quot;notes&quot;, e.target.value)}
                  placeholder=&quot;Add any additional notes about this deactivation...&quot;
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assignment Transfer */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Transfer</CardTitle>
              <CardDescription>
                Manage existing assignments and responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;transferAssignments&quot;
                  checked={deactivationData.transferAssignments}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;transferAssignments&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;transferAssignments&quot;>
                  Transfer assignments to another team member
                </Label>
              </div>

              {deactivationData.transferAssignments && (
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;transferTo&quot;>Transfer To</Label>
                  <Select
                    value={deactivationData.transferTo}
                    onValueChange={(value) =>
                      handleInputChange(&quot;transferTo&quot;, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select team member&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;member-2&quot;>Michael Chen</SelectItem>
                      <SelectItem value=&quot;member-3&quot;>Emily Davis</SelectItem>
                      <SelectItem value=&quot;member-4&quot;>David Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className=&quot;bg-yellow-50 border border-yellow-200 rounded-lg p-4&quot;>
                <div className=&quot;flex items-center space-x-2 text-yellow-800&quot;>
                  <AlertTriangle className=&quot;h-4 w-4&quot; />
                  <span className=&quot;font-medium&quot;>Impact Assessment</span>
                </div>
                <div className=&quot;mt-2 text-sm text-yellow-700&quot;>
                  <p>
                    • {member.upcomingEvents} upcoming events will be affected
                  </p>
                  <p>
                    • {member.activeAssignments} active assignments need to be
                    reassigned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Administrative Tasks</CardTitle>
              <CardDescription>
                Administrative actions to complete during deactivation
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;notifyMember&quot;
                  checked={deactivationData.notifyMember}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;notifyMember&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;notifyMember&quot;>
                  Send deactivation notice to team member
                </Label>
              </div>

              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;finalPayroll&quot;
                  checked={deactivationData.finalPayroll}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;finalPayroll&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;finalPayroll&quot;>Process final payroll</Label>
              </div>

              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;returnEquipment&quot;
                  checked={deactivationData.returnEquipment}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;returnEquipment&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;returnEquipment&quot;>
                  Collect company equipment
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className=&quot;space-y-6&quot;>
          {/* Team Member Info */}
          <Card>
            <CardHeader>
              <CardTitle>Team Member</CardTitle>
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
                  <p className=&quot;text-sm text-muted-foreground&quot;>{member.role}</p>
                  <Badge
                    variant={
                      member.status === &quot;active&quot; ? &quot;default&quot; : &quot;secondary&quot;
                    }
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>
                Current assignments and commitments
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;flex justify-between&quot;>
                <span className=&quot;text-sm&quot;>Upcoming Events</span>
                <span className=&quot;font-medium&quot;>{member.upcomingEvents}</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span className=&quot;text-sm&quot;>Active Assignments</span>
                <span className=&quot;font-medium&quot;>{member.activeAssignments}</span>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <span className=&quot;text-sm&quot;>Account Status</span>
                <Badge variant=&quot;default&quot;>{member.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center text-red-600&quot;>
                <AlertTriangle className=&quot;h-5 w-5 mr-2&quot; />
                Confirmation Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Checkbox
                  id=&quot;confirmDeactivation&quot;
                  checked={deactivationData.confirmDeactivation}
                  onCheckedChange={(checked) =>
                    handleInputChange(&quot;confirmDeactivation&quot;, checked as boolean)
                  }
                />
                <Label htmlFor=&quot;confirmDeactivation&quot; className=&quot;text-sm">
                  I understand this action cannot be undone and confirm I want
                  to deactivate this team member
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
