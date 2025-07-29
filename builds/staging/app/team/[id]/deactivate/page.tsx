"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, UserX, Clock, FileText } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface DeactivateTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock team member data
const getTeamMemberById = (id: string) => {
  const members = {
    "1": {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "Brand Agent",
      status: "active",
      upcomingEvents: 3,
      activeAssignments: 2,
    },
    "2": {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@example.com",
      role: "Brand Agent",
      status: "active",
      upcomingEvents: 1,
      activeAssignments: 1,
    },
    "3": {
      id: "3",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Field Manager",
      status: "active",
      upcomingEvents: 0,
      activeAssignments: 0,
    },
    "4": {
      id: "4",
      name: "David Wilson",
      email: "david.wilson@example.com",
      role: "Brand Agent",
      status: "active",
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
    reason: "",
    customReason: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    notifyMember: true,
    transferAssignments: true,
    transferTo: "",
    finalPayroll: true,
    returnEquipment: false,
    notes: "",
    confirmDeactivation: false,
  });

  const [isDeactivating, setIsDeactivating] = useState(false);

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setDeactivationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeactivate = async () => {
    if (!deactivationData.reason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for deactivation.",
        variant: "destructive",
      });
      return;
    }

    if (
      deactivationData.reason === "other" &&
      !deactivationData.customReason.trim()
    ) {
      toast({
        title: "Custom Reason Required",
        description: "Please provide a custom reason for deactivation.",
        variant: "destructive",
      });
      return;
    }

    if (!deactivationData.confirmDeactivation) {
      toast({
        title: "Confirmation Required",
        description:
          "Please confirm that you want to deactivate this team member.",
        variant: "destructive",
      });
      return;
    }

    setIsDeactivating(true);

    try {
      // Deactivate team member
      const deactivateResponse = await fetch(`/api/team/${id}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason:
            deactivationData.reason === "other"
              ? deactivationData.customReason
              : deactivationData.reason,
          effectiveDate: deactivationData.effectiveDate,
          transferAssignments: deactivationData.transferAssignments,
          transferTo: deactivationData.transferTo,
          notes: deactivationData.notes,
          deactivatedBy: "current-user-id",
        }),
      });

      if (!deactivateResponse.ok) {
        throw new Error("Failed to deactivate team member");
      }

      // Send notification to member if requested
      if (deactivationData.notifyMember) {
        await fetch("/api/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: id,
            recipientEmail: member.email,
            subject: "Account Deactivation Notice",
            body: `Dear ${member.name},\n\nThis is to inform you that your account will be deactivated effective ${deactivationData.effectiveDate}.\n\nReason: ${deactivationData.reason === "other" ? deactivationData.customReason : deactivationData.reason}\n\nIf you have any questions, please contact your manager.\n\nBest regards,\nHR Team`,
            priority: "high",
            deliveryMethod: "email",
            sentBy: "current-user-id",
          }),
        });
      }

      // Create final payroll task if needed
      if (deactivationData.finalPayroll) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Process Final Payroll - ${member.name}`,
            description: `Process final payroll for deactivated team member: ${member.name}`,
            type: "payroll_processing",
            assignedTo: "hr-admin-id",
            assignedBy: "current-user-id",
            dueDate: deactivationData.effectiveDate,
            priority: "high",
            status: "assigned",
          }),
        });
      }

      // Create equipment return task if needed
      if (deactivationData.returnEquipment) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Equipment Return - ${member.name}`,
            description: `Collect equipment from deactivated team member: ${member.name}`,
            type: "equipment_return",
            assignedTo: "it-admin-id",
            assignedBy: "current-user-id",
            dueDate: deactivationData.effectiveDate,
            priority: "normal",
            status: "assigned",
          }),
        });
      }

      // Publish deactivation event
      await fetch("/api/events/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "team.member.deactivated",
          payload: {
            memberId: id,
            memberName: member.name,
            reason:
              deactivationData.reason === "other"
                ? deactivationData.customReason
                : deactivationData.reason,
            effectiveDate: deactivationData.effectiveDate,
            transferAssignments: deactivationData.transferAssignments,
            transferTo: deactivationData.transferTo,
            deactivatedBy: "current-user-id",
            organizationId: "current-org-id",
          },
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Team Member Deactivated",
        description: `${member.name} has been successfully deactivated.`,
      });

      router.push("/team");
    } catch (error) {
      toast({
        title: "Deactivation Failed",
        description: "There was an error deactivating the team member.",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const reasonOptions = [
    { value: "resignation", label: "Resignation" },
    { value: "termination", label: "Termination" },
    { value: "layoff", label: "Layoff" },
    { value: "retirement", label: "Retirement" },
    { value: "contract_end", label: "Contract End" },
    { value: "performance", label: "Performance Issues" },
    { value: "misconduct", label: "Misconduct" },
    { value: "other", label: "Other" },
  ];

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
            <h1 className="text-3xl font-bold">Deactivate Team Member</h1>
            <p className="text-muted-foreground">
              Deactivate {member.name}'s account
            </p>
          </div>
        </div>
        <Button
          onClick={handleDeactivate}
          disabled={isDeactivating}
          variant="destructive"
        >
          <UserX className="h-4 w-4 mr-2" />
          {isDeactivating ? "Deactivating..." : "Deactivate Member"}
        </Button>
      </div>

      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning: This action cannot be undone</AlertTitle>
        <AlertDescription>
          Deactivating this team member will remove their access to the system
          and may affect ongoing assignments and events.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deactivation Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason for Deactivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Reason for Deactivation
              </CardTitle>
              <CardDescription>
                Provide the reason for deactivating this team member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select
                  value={deactivationData.reason}
                  onValueChange={(value) => handleInputChange("reason", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
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

              {deactivationData.reason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customReason">Custom Reason</Label>
                  <Input
                    id="customReason"
                    value={deactivationData.customReason}
                    onChange={(e) =>
                      handleInputChange("customReason", e.target.value)
                    }
                    placeholder="Please specify the reason"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={deactivationData.effectiveDate}
                  onChange={(e) =>
                    handleInputChange("effectiveDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={deactivationData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add any additional notes about this deactivation..."
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
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transferAssignments"
                  checked={deactivationData.transferAssignments}
                  onCheckedChange={(checked) =>
                    handleInputChange("transferAssignments", checked as boolean)
                  }
                />
                <Label htmlFor="transferAssignments">
                  Transfer assignments to another team member
                </Label>
              </div>

              {deactivationData.transferAssignments && (
                <div className="space-y-2">
                  <Label htmlFor="transferTo">Transfer To</Label>
                  <Select
                    value={deactivationData.transferTo}
                    onValueChange={(value) =>
                      handleInputChange("transferTo", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member-2">Michael Chen</SelectItem>
                      <SelectItem value="member-3">Emily Davis</SelectItem>
                      <SelectItem value="member-4">David Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Impact Assessment</span>
                </div>
                <div className="mt-2 text-sm text-yellow-700">
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
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyMember"
                  checked={deactivationData.notifyMember}
                  onCheckedChange={(checked) =>
                    handleInputChange("notifyMember", checked as boolean)
                  }
                />
                <Label htmlFor="notifyMember">
                  Send deactivation notice to team member
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="finalPayroll"
                  checked={deactivationData.finalPayroll}
                  onCheckedChange={(checked) =>
                    handleInputChange("finalPayroll", checked as boolean)
                  }
                />
                <Label htmlFor="finalPayroll">Process final payroll</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="returnEquipment"
                  checked={deactivationData.returnEquipment}
                  onCheckedChange={(checked) =>
                    handleInputChange("returnEquipment", checked as boolean)
                  }
                />
                <Label htmlFor="returnEquipment">
                  Collect company equipment
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Team Member Info */}
          <Card>
            <CardHeader>
              <CardTitle>Team Member</CardTitle>
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
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <Badge
                    variant={
                      member.status === "active" ? "default" : "secondary"
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
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Upcoming Events</span>
                <span className="font-medium">{member.upcomingEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Assignments</span>
                <span className="font-medium">{member.activeAssignments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Account Status</span>
                <Badge variant="default">{member.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Confirmation Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmDeactivation"
                  checked={deactivationData.confirmDeactivation}
                  onCheckedChange={(checked) =>
                    handleInputChange("confirmDeactivation", checked as boolean)
                  }
                />
                <Label htmlFor="confirmDeactivation" className="text-sm">
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
