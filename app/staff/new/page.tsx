&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

export default function AddStaffMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: &quot;Staff Member Added&quot;,
        description: &quot;The new staff member has been successfully added to the system.&quot;,
      });
      router.push(&quot;/staff&quot;);
    }, 1500);
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center space-x-4&quot;>
        <Button
          variant=&quot;ghost&quot;
          size=&quot;sm&quot;
          onClick={() => router.back()}
        >
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
          Back to Staff
        </Button>
      </div>

      <div className=&quot;max-w-2xl mx-auto&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <User className=&quot;h-5 w-5 mr-2&quot; />
              Add New Staff Member
            </CardTitle>
            <CardDescription>
              Create a new staff member profile for the Rishi Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=&quot;space-y-6&quot;>
              {/* Personal Information */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Personal Information</h3>
                
                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;firstName&quot;>First Name</Label>
                    <Input id=&quot;firstName&quot; placeholder=&quot;Enter first name&quot; required />
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;lastName&quot;>Last Name</Label>
                    <Input id=&quot;lastName&quot; placeholder=&quot;Enter last name&quot; required />
                  </div>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;email&quot;>Email Address</Label>
                  <div className=&quot;relative&quot;>
                    <Mail className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      id=&quot;email&quot;
                      type=&quot;email&quot;
                      placeholder=&quot;Enter email address&quot;
                      className=&quot;pl-10&quot;
                      required
                    />
                  </div>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;phone&quot;>Phone Number</Label>
                  <div className=&quot;relative&quot;>
                    <Phone className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      id=&quot;phone&quot;
                      placeholder=&quot;Enter phone number&quot;
                      className=&quot;pl-10&quot;
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Role & Permissions */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Role & Permissions</h3>
                
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;role&quot;>Role</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select role&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;internal_field_manager&quot;>Field Manager</SelectItem>
                      <SelectItem value=&quot;brand_agent&quot;>Brand Agent</SelectItem>
                      <SelectItem value=&quot;internal_admin&quot;>Internal Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;location&quot;>Primary Location</Label>
                  <div className=&quot;relative&quot;>
                    <MapPin className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      id=&quot;location&quot;
                      placeholder=&quot;Enter city, state&quot;
                      className=&quot;pl-10&quot;
                      required
                    />
                  </div>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;department&quot;>Department</Label>
                  <div className=&quot;relative&quot;>
                    <Briefcase className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      id=&quot;department&quot;
                      placeholder=&quot;e.g., Field Operations, Brand Management&quot;
                      className=&quot;pl-10&quot;
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Additional Information</h3>
                
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;notes&quot;>Notes</Label>
                  <Textarea
                    id=&quot;notes&quot;
                    placeholder=&quot;Additional notes about this staff member...&quot;
                    rows={3}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className=&quot;flex gap-4 pt-6&quot;>
                <Button
                  type=&quot;button&quot;
                  variant=&quot;outline&quot;
                  className=&quot;flex-1&quot;
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type=&quot;submit&quot;
                  className=&quot;flex-1&quot;
                  disabled={isSubmitting}
                >
                  {isSubmitting ? &quot;Creating...&quot; : &quot;Create Staff Member&quot;}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}