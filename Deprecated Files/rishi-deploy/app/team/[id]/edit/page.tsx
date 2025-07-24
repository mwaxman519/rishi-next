"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
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
import Link from "next/link";

interface EditTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock data for team member details
const getTeamMemberById = (id: string) => {
  const members = {
    "1": {
      id: "1",
      name: "Sarah Johnson",
      role: "Brand Agent",
      email: "sarah.johnson@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      status: "active",
      startDate: "2023-03-15",
      department: "Field Operations",
      manager: "Jessica Chen",
      emergencyContact: {
        name: "Mike Johnson",
        phone: "+1 (555) 987-6543",
        relationship: "Spouse",
      },
      skills: ["Product Demos", "Corporate Events", "Trade Shows"],
      certifications: ["CPR Certified", "Product Knowledge Level 2"],
      notes:
        "Excellent performance in corporate events. Preferred for high-profile clients.",
    },
    "2": {
      id: "2",
      name: "Michael Chen",
      role: "Brand Agent",
      email: "michael.chen@example.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, CA",
      status: "active",
      startDate: "2023-01-20",
      department: "Field Operations",
      manager: "Jessica Chen",
      emergencyContact: {
        name: "Lisa Chen",
        phone: "+1 (555) 876-5432",
        relationship: "Sister",
      },
      skills: ["Trade Shows", "Retail Demos", "Training"],
      certifications: ["Product Knowledge Level 3", "Safety Training"],
      notes: "Strong technical knowledge. Great for training new team members.",
    },
  };

  return members[id as keyof typeof members] || null;
};

export default function EditTeamMemberPage({ params }: EditTeamMemberProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const member = getTeamMemberById(id);

  const [formData, setFormData] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    location: member?.location || "",
    role: member?.role || "",
    status: member?.status || "active",
    department: member?.department || "",
    manager: member?.manager || "",
    emergencyContactName: member?.emergencyContact?.name || "",
    emergencyContactPhone: member?.emergencyContact?.phone || "",
    emergencyContactRelationship: member?.emergencyContact?.relationship || "",
    skills: member?.skills?.join(", ") || "",
    certifications: member?.certifications?.join(", ") || "",
    notes: member?.notes || "",
  });

  const [isLoading, setIsLoading] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Simulate API call to update team member
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update member data (in real app, this would be an API call)
      const updatedData = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        certifications: formData.certifications
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c),
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
      };

      // Publish update event
      await fetch("/api/events/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "team.member.updated",
          payload: {
            memberId: id,
            updatedFields: Object.keys(formData),
            updatedBy: "current-user-id",
            organizationId: "current-org-id",
            changes: updatedData,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Team Member Updated",
        description: `${formData.name}'s details have been successfully updated.`,
      });

      // Redirect back to team member profile
      router.push(`/team/${id}`);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the team member details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <h1 className="text-3xl font-bold">Edit Team Member</h1>
            <p className="text-muted-foreground">
              Update {member.name}'s information
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>Personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Work Information
              </CardTitle>
              <CardDescription>Role and organizational details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brand Agent">Brand Agent</SelectItem>
                      <SelectItem value="Field Manager">
                        Field Manager
                      </SelectItem>
                      <SelectItem value="Team Lead">Team Lead</SelectItem>
                      <SelectItem value="Coordinator">Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) =>
                      handleInputChange("manager", e.target.value)
                    }
                    placeholder="Enter manager name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contact
              </CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange("emergencyContactName", e.target.value)
                    }
                    placeholder="Enter contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyContactPhone", e.target.value)
                    }
                    placeholder="Enter contact phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">
                    Relationship
                  </Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContactRelationship",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage
                  src={`/avatars/${member.name.toLowerCase().replace(" ", "-")}.jpg`}
                />
                <AvatarFallback className="text-2xl">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </CardContent>
          </Card>

          {/* Skills & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="Enter skills separated by commas"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">
                  Certifications (comma-separated)
                </Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) =>
                    handleInputChange("certifications", e.target.value)
                  }
                  placeholder="Enter certifications separated by commas"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional notes about this team member..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
