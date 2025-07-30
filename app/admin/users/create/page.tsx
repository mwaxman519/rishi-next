&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { AlertCircle, ArrowLeft, Save } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { createUser } from &quot;@/actions/users&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;

// Define the form schema with Zod for validation
const userFormSchema = z.object({
  username: z.string().min(3, &quot;Username must be at least 3 characters&quot;).max(50),
  password: z
    .string()
    .min(8, &quot;Password must be at least 8 characters&quot;)
    .regex(/[A-Z]/, &quot;Password must contain at least one uppercase letter&quot;)
    .regex(/[a-z]/, &quot;Password must contain at least one lowercase letter&quot;)
    .regex(/[0-9]/, &quot;Password must contain at least one number&quot;),
  fullName: z
    .string()
    .min(2, &quot;Full name must be at least 2 characters&quot;)
    .max(100),
  email: z.string().email(&quot;Invalid email address&quot;),
  phone: z
    .string()
    .min(10, &quot;Phone number must be at least 10 digits&quot;)
    .optional(),
  role: z.string().min(1, &quot;Role is required&quot;),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});

// Infer the form data type from the schema
type UserFormValues = z.infer<typeof userFormSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { checkPermission } = useAuthorization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "&quot;,
      password: &quot;&quot;,
      fullName: &quot;&quot;,
      email: &quot;&quot;,
      phone: &quot;&quot;,
      role: &quot;brand_agent&quot;, // Default role
      active: true,
      notes: &quot;&quot;,
    },
  });

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createUser({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || &quot;&quot;,
        role: data.role,
        active: data.active,
        notes: data.notes || &quot;&quot;,
        // Other fields might be required based on your model
      });

      if (response.success && response.data) {
        toast({
          title: &quot;User Created&quot;,
          description: &quot;The user has been created successfully.&quot;,
          variant: &quot;default&quot;,
        });

        // Redirect to the user detail page or users list
        router.push(&quot;/admin/users&quot;);
      } else {
        setError(response.error || &quot;Failed to create user&quot;);
      }
    } catch (err) {
      console.error(&quot;Error creating user:&quot;, err);
      setError(&quot;An unexpected error occurred. Please try again.&quot;);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check admin permissions
  const isSuperAdmin = user?.role === &quot;super_admin&quot;;
  const isInternalAdmin = user?.role === &quot;internal_admin&quot;;
  const hasAdminAccess = isSuperAdmin || isInternalAdmin;

  if (authLoading) {
    return (
      <div className=&quot;flex justify-center items-center min-h-screen&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className=&quot;p-6&quot;>
        <Alert variant=&quot;destructive&quot; className=&quot;mb-6&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have administrative permission to access this page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push(&quot;/&quot;)} variant=&quot;outline&quot;>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Role options based on the current user's role
  const roleOptions = isSuperAdmin
    ? [
        { value: &quot;super_admin&quot;, label: &quot;Super Admin&quot; },
        { value: &quot;internal_admin&quot;, label: &quot;Internal Admin&quot; },
        { value: &quot;internal_field_manager&quot;, label: &quot;Internal Field Manager&quot; },
        { value: &quot;field_coordinator&quot;, label: &quot;Field Coordinator&quot; },
        { value: &quot;brand_agent&quot;, label: &quot;Brand Agent&quot; },
        { value: &quot;client_manager&quot;, label: &quot;Client Manager&quot; },
        { value: &quot;client_user&quot;, label: &quot;Client User&quot; },
      ]
    : [
        { value: &quot;internal_field_manager&quot;, label: &quot;Internal Field Manager&quot; },
        { value: &quot;field_coordinator&quot;, label: &quot;Field Coordinator&quot; },
        { value: &quot;brand_agent&quot;, label: &quot;Brand Agent&quot; },
        { value: &quot;client_manager&quot;, label: &quot;Client Manager&quot; },
        { value: &quot;client_user&quot;, label: &quot;Client User&quot; },
      ];

  return (
    <div className=&quot;p-4 space-y-6 max-w-4xl mx-auto&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>Create New User</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Add a new user with appropriate permissions
          </p>
        </div>
        <Button variant=&quot;outline&quot; onClick={() => router.push(&quot;/admin/users&quot;)}>
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
          Back to Users
        </Button>
      </div>

      {error && (
        <Alert variant=&quot;destructive&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter the details for the new user</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-8&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                {/* Username */}
                <FormField
                  control={form.control}
                  name=&quot;username&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder=&quot;username&quot; {...field} />
                      </FormControl>
                      <FormDescription>
                        The login name for the user.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name=&quot;password&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type=&quot;password&quot;
                          placeholder=&quot;••••••••&quot;
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters with mixed case and
                        numbers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name=&quot;fullName&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder=&quot;John Doe&quot; {...field} />
                      </FormControl>
                      <FormDescription>User's complete name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name=&quot;email&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type=&quot;email&quot;
                          placeholder=&quot;user@example.com&quot;
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        User's email address for communications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name=&quot;phone&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type=&quot;tel&quot;
                          placeholder=&quot;(555) 123-4567&quot;
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        User's contact phone number.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role */}
                <FormField
                  control={form.control}
                  name=&quot;role&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select a role&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The user's role determines their permissions in the
                        system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Additional Settings */}
              <div>
                <h3 className=&quot;text-lg font-medium mb-4&quot;>
                  Additional Settings
                </h3>

                {/* Active Status */}
                <FormField
                  control={form.control}
                  name=&quot;active&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-6&quot;>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className=&quot;space-y-1 leading-none&quot;>
                        <FormLabel>Active Account</FormLabel>
                        <FormDescription>
                          If unchecked, the user will not be able to log in.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name=&quot;notes&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=&quot;Any additional information about this user...&quot;
                          className=&quot;resize-y&quot;
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes visible to administrators only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className=&quot;flex justify-end space-x-3&quot;>
                <Button
                  type=&quot;button&quot;
                  variant=&quot;outline&quot;
                  onClick={() => router.push(&quot;/admin/users&quot;)}
                >
                  Cancel
                </Button>
                <Button type=&quot;submit&quot; disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className=&quot;animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full&quot;></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className=&quot;mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
