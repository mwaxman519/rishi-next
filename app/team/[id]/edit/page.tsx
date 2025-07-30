&quot;use client&quot;;

import { useState, use } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
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
import Link from &quot;next/link&quot;;

interface EditTeamMemberProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock data for team member details
const getTeamMemberById = (id: string) => {
  const members = {
    &quot;1&quot;: {
      id: &quot;1&quot;,
      name: &quot;Sarah Johnson&quot;,
      role: &quot;Brand Agent&quot;,
      email: &quot;sarah.johnson@example.com&quot;,
      phone: &quot;+1 (555) 123-4567&quot;,
      location: &quot;San Francisco, CA&quot;,
      status: &quot;active&quot;,
      startDate: &quot;2023-03-15&quot;,
      department: &quot;Field Operations&quot;,
      manager: &quot;Jessica Chen&quot;,
      emergencyContact: {
        name: &quot;Mike Johnson&quot;,
        phone: &quot;+1 (555) 987-6543&quot;,
        relationship: &quot;Spouse&quot;,
      },
      skills: [&quot;Product Demos&quot;, &quot;Corporate Events&quot;, &quot;Trade Shows&quot;],
      certifications: [&quot;CPR Certified&quot;, &quot;Product Knowledge Level 2&quot;],
      notes:
        &quot;Excellent performance in corporate events. Preferred for high-profile clients.&quot;,
    },
    &quot;2&quot;: {
      id: &quot;2&quot;,
      name: &quot;Michael Chen&quot;,
      role: &quot;Brand Agent&quot;,
      email: &quot;michael.chen@example.com&quot;,
      phone: &quot;+1 (555) 234-5678&quot;,
      location: &quot;Los Angeles, CA&quot;,
      status: &quot;active&quot;,
      startDate: &quot;2023-01-20&quot;,
      department: &quot;Field Operations&quot;,
      manager: &quot;Jessica Chen&quot;,
      emergencyContact: {
        name: &quot;Lisa Chen&quot;,
        phone: &quot;+1 (555) 876-5432&quot;,
        relationship: &quot;Sister&quot;,
      },
      skills: [&quot;Trade Shows&quot;, &quot;Retail Demos&quot;, &quot;Training&quot;],
      certifications: [&quot;Product Knowledge Level 3&quot;, &quot;Safety Training&quot;],
      notes: &quot;Strong technical knowledge. Great for training new team members.&quot;,
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
    name: member?.name || "&quot;,
    email: member?.email || &quot;&quot;,
    phone: member?.phone || &quot;&quot;,
    location: member?.location || &quot;&quot;,
    role: member?.role || &quot;&quot;,
    status: member?.status || &quot;active&quot;,
    department: member?.department || &quot;&quot;,
    manager: member?.manager || &quot;&quot;,
    emergencyContactName: member?.emergencyContact?.name || &quot;&quot;,
    emergencyContactPhone: member?.emergencyContact?.phone || &quot;&quot;,
    emergencyContactRelationship: member?.emergencyContact?.relationship || &quot;&quot;,
    skills: member?.skills?.join(&quot;, &quot;) || &quot;&quot;,
    certifications: member?.certifications?.join(&quot;, &quot;) || &quot;&quot;,
    notes: member?.notes || &quot;&quot;,
  });

  const [isLoading, setIsLoading] = useState(false);

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
          .split(&quot;,&quot;)
          .map((s) => s.trim())
          .filter((s) => s),
        certifications: formData.certifications
          .split(&quot;,&quot;)
          .map((c) => c.trim())
          .filter((c) => c),
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
      };

      // Publish update event
      await fetch(&quot;/api/events/publish&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          eventType: &quot;team.member.updated&quot;,
          payload: {
            memberId: id,
            updatedFields: Object.keys(formData),
            updatedBy: &quot;current-user-id&quot;,
            organizationId: &quot;current-org-id&quot;,
            changes: updatedData,
          },
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: &quot;Team Member Updated&quot;,
        description: `${formData.name}'s details have been successfully updated.`,
      });

      // Redirect back to team member profile
      router.push(`/team/${id}`);
    } catch (error) {
      toast({
        title: &quot;Update Failed&quot;,
        description: &quot;There was an error updating the team member details.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsLoading(false);
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
            <h1 className=&quot;text-3xl font-bold&quot;>Edit Team Member</h1>
            <p className=&quot;text-muted-foreground&quot;>
              Update {member.name}'s information
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className=&quot;h-4 w-4 mr-2&quot; />
          {isLoading ? &quot;Saving...&quot; : &quot;Save Changes&quot;}
        </Button>
      </div>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
        {/* Profile Information */}
        <div className=&quot;lg:col-span-2 space-y-6&quot;>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <User className=&quot;h-5 w-5 mr-2&quot; />
                Basic Information
              </CardTitle>
              <CardDescription>Personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;name&quot;>Full Name</Label>
                  <Input
                    id=&quot;name&quot;
                    value={formData.name}
                    onChange={(e) => handleInputChange(&quot;name&quot;, e.target.value)}
                    placeholder=&quot;Enter full name&quot;
                  />
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;email&quot;>Email Address</Label>
                  <Input
                    id=&quot;email&quot;
                    type=&quot;email&quot;
                    value={formData.email}
                    onChange={(e) => handleInputChange(&quot;email&quot;, e.target.value)}
                    placeholder=&quot;Enter email address&quot;
                  />
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;phone&quot;>Phone Number</Label>
                  <Input
                    id=&quot;phone&quot;
                    value={formData.phone}
                    onChange={(e) => handleInputChange(&quot;phone&quot;, e.target.value)}
                    placeholder=&quot;Enter phone number&quot;
                  />
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;location&quot;>Location</Label>
                  <Input
                    id=&quot;location&quot;
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange(&quot;location&quot;, e.target.value)
                    }
                    placeholder=&quot;Enter location&quot;
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <Shield className=&quot;h-5 w-5 mr-2&quot; />
                Work Information
              </CardTitle>
              <CardDescription>Role and organizational details</CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;role&quot;>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange(&quot;role&quot;, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select role&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;Brand Agent&quot;>Brand Agent</SelectItem>
                      <SelectItem value=&quot;Field Manager&quot;>
                        Field Manager
                      </SelectItem>
                      <SelectItem value=&quot;Team Lead&quot;>Team Lead</SelectItem>
                      <SelectItem value=&quot;Coordinator&quot;>Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;status&quot;>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange(&quot;status&quot;, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select status&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;active&quot;>Active</SelectItem>
                      <SelectItem value=&quot;inactive&quot;>Inactive</SelectItem>
                      <SelectItem value=&quot;on_leave&quot;>On Leave</SelectItem>
                      <SelectItem value=&quot;training&quot;>Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;department&quot;>Department</Label>
                  <Input
                    id=&quot;department&quot;
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange(&quot;department&quot;, e.target.value)
                    }
                    placeholder=&quot;Enter department&quot;
                  />
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;manager&quot;>Manager</Label>
                  <Input
                    id=&quot;manager&quot;
                    value={formData.manager}
                    onChange={(e) =>
                      handleInputChange(&quot;manager&quot;, e.target.value)
                    }
                    placeholder=&quot;Enter manager name&quot;
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <Phone className=&quot;h-5 w-5 mr-2&quot; />
                Emergency Contact
              </CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;emergencyContactName&quot;>Contact Name</Label>
                  <Input
                    id=&quot;emergencyContactName&quot;
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange(&quot;emergencyContactName&quot;, e.target.value)
                    }
                    placeholder=&quot;Enter contact name&quot;
                  />
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;emergencyContactPhone&quot;>Contact Phone</Label>
                  <Input
                    id=&quot;emergencyContactPhone&quot;
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      handleInputChange(&quot;emergencyContactPhone&quot;, e.target.value)
                    }
                    placeholder=&quot;Enter contact phone&quot;
                  />
                </div>
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;emergencyContactRelationship&quot;>
                    Relationship
                  </Label>
                  <Input
                    id=&quot;emergencyContactRelationship&quot;
                    value={formData.emergencyContactRelationship}
                    onChange={(e) =>
                      handleInputChange(
                        &quot;emergencyContactRelationship&quot;,
                        e.target.value,
                      )
                    }
                    placeholder=&quot;e.g., Spouse, Parent&quot;
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className=&quot;space-y-6&quot;>
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className=&quot;text-center space-y-4&quot;>
              <Avatar className=&quot;w-24 h-24 mx-auto&quot;>
                <AvatarImage
                  src={`/avatars/${member.name.toLowerCase().replace(&quot; &quot;, &quot;-&quot;)}.jpg`}
                />
                <AvatarFallback className=&quot;text-2xl&quot;>
                  {member.name
                    .split(&quot; &quot;)
                    .map((n) => n[0])
                    .join(&quot;&quot;)}
                </AvatarFallback>
              </Avatar>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                Change Photo
              </Button>
            </CardContent>
          </Card>

          {/* Skills & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;skills&quot;>Skills (comma-separated)</Label>
                <Textarea
                  id=&quot;skills&quot;
                  value={formData.skills}
                  onChange={(e) => handleInputChange(&quot;skills&quot;, e.target.value)}
                  placeholder=&quot;Enter skills separated by commas&quot;
                  rows={3}
                />
              </div>
              <div className=&quot;space-y-2&quot;>
                <Label htmlFor=&quot;certifications&quot;>
                  Certifications (comma-separated)
                </Label>
                <Textarea
                  id=&quot;certifications&quot;
                  value={formData.certifications}
                  onChange={(e) =>
                    handleInputChange(&quot;certifications&quot;, e.target.value)
                  }
                  placeholder=&quot;Enter certifications separated by commas&quot;
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
                onChange={(e) => handleInputChange(&quot;notes&quot;, e.target.value)}
                placeholder=&quot;Add any additional notes about this team member..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
