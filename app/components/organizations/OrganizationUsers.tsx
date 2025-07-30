&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useMutation, useQuery, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import { USER_ROLES } from &quot;@/lib/constants&quot;;
import { apiRequest } from &quot;@/lib/api&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;
import { Loader2, Mail, UserPlus, X } from &quot;lucide-react&quot;;

// Form validation schema for inviting users
const invitationFormSchema = z.object({
  email: z.string().email({ message: &quot;Please enter a valid email address&quot; }),
  role: z.string({ required_error: &quot;Please select a role&quot; }),
});

type InvitationFormValues = z.infer<typeof invitationFormSchema>;

// Type definitions for API responses
interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  primary_organization?: string;
  is_primary?: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface UsersResponse {
  users: User[];
}

interface InvitationsResponse {
  invitations: Invitation[];
}

interface OrganizationUsersProps {
  organizationId: string;
  organizationName: string;
}

export function OrganizationUsers({
  organizationId,
  organizationName,
}: OrganizationUsersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Initialize form
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: "&quot;,
      role: &quot;&quot;,
    },
  });

  // Fetch organization users
  const { data: usersData, isLoading: isUsersLoading } =
    useQuery<UsersResponse>({
      queryKey: [`/api/organizations/users?organizationId=${organizationId}`],
      enabled: !!organizationId,
    });

  // Fetch active invitations
  const { data: invitationsData, isLoading: isInvitationsLoading } =
    useQuery<InvitationsResponse>({
      queryKey: [
        `/api/organizations/invitations?organizationId=${organizationId}`,
      ],
      enabled: !!organizationId,
    });

  // Mutation for sending invitations
  const sendInvitationMutation = useMutation({
    mutationFn: async (values: InvitationFormValues) => {
      return apiRequest(&quot;POST&quot;, &quot;/api/organizations/invitations&quot;, {
        ...values,
        organizationId,
      });
    },
    onSuccess: () => {
      toast({
        title: &quot;Invitation Sent&quot;,
        description: `An invitation has been sent to ${form.getValues().email}`,
      });
      setIsInviteDialogOpen(false);
      form.reset();
      // Invalidate invitations query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [
          `/api/organizations/invitations?organizationId=${organizationId}`,
        ],
      });
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;No error details available&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Mutation for canceling invitations
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return apiRequest(
        &quot;DELETE&quot;,
        `/api/organizations/invitations?id=${invitationId}`,
      );
    },
    onSuccess: () => {
      toast({
        title: &quot;Invitation Cancelled&quot;,
        description: &quot;The invitation has been cancelled successfully&quot;,
      });
      // Invalidate invitations query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [
          `/api/organizations/invitations?organizationId=${organizationId}`,
        ],
      });
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;No error details available&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Mutation for removing users from organization
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(
        &quot;DELETE&quot;,
        `/api/organizations/users?userId=${userId}&organizationId=${organizationId}`,
      );
    },
    onSuccess: () => {
      toast({
        title: &quot;User Removed&quot;,
        description:
          &quot;The user has been removed from the organization successfully&quot;,
      });
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [`/api/organizations/users?organizationId=${organizationId}`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message || &quot;No error details available&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: InvitationFormValues) => {
    sendInvitationMutation.mutate(values);
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(&quot; &quot;)
      .map((n) => n[0])
      .join(&quot;&quot;)
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to format role names
  function formatRoleName(role: string) {
    return role
      .split(&quot;_&quot;)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(&quot; &quot;);
  }

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h3 className=&quot;text-lg font-medium&quot;>{organizationName} Users</h3>
          <p className=&quot;text-sm text-muted-foreground&quot;>
            Manage users who have access to this organization
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className=&quot;gap-2&quot;>
              <UserPlus className=&quot;h-4 w-4&quot; />
              <span>Invite User</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a new user</DialogTitle>
              <DialogDescription>
                Enter the email address and role for the new user. An invitation
                will be sent via email.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=&quot;space-y-4&quot;
              >
                <FormField
                  control={form.control}
                  name=&quot;email&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder=&quot;user@example.com&quot; {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {formatRoleName(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;outline&quot;
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type=&quot;submit&quot;
                    disabled={sendInvitationMutation.isPending}
                  >
                    {sendInvitationMutation.isPending && (
                      <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                    )}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Organization Users</CardTitle>
          <CardDescription>
            Users with access to the organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className=&quot;flex justify-center py-8&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Primary Organization</TableHead>
                  <TableHead className=&quot;text-right&quot;>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className=&quot;font-medium&quot;>
                        <div className=&quot;flex items-center gap-2&quot;>
                          <Avatar className=&quot;h-8 w-8&quot;>
                            {user.avatar_url ? (
                              <AvatarImage
                                src={user.avatar_url}
                                alt={user.name}
                              />
                            ) : (
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.is_primary ? (
                          <span className=&quot;text-green-600 font-medium&quot;>
                            Primary
                          </span>
                        ) : (
                          <span className=&quot;text-muted-foreground&quot;>
                            Secondary
                          </span>
                        )}
                      </TableCell>
                      <TableCell className=&quot;text-right&quot;>
                        <Button
                          variant=&quot;ghost&quot;
                          size=&quot;sm&quot;
                          onClick={() => removeUserMutation.mutate(user.id)}
                          disabled={
                            user.is_primary || removeUserMutation.isPending
                          }
                          className=&quot;h-8 w-8 p-0&quot;
                        >
                          {removeUserMutation.isPending ? (
                            <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
                          ) : (
                            <X className=&quot;h-4 w-4&quot; />
                          )}
                          <span className=&quot;sr-only&quot;>Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className=&quot;text-center py-6 text-muted-foreground&quot;
                    >
                      No users found for this organization
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Users who have been invited but have not yet accepted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInvitationsLoading ? (
            <div className=&quot;flex justify-center py-8&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className=&quot;text-right&quot;>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitationsData?.invitations &&
                Array.isArray(invitationsData.invitations) &&
                invitationsData.invitations.length > 0 ? (
                  invitationsData.invitations.map((invitation: Invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className=&quot;font-medium&quot;>
                        <div className=&quot;flex items-center gap-2&quot;>
                          <Mail className=&quot;h-4 w-4 text-muted-foreground&quot; />
                          <span>{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatRoleName(invitation.role)}</TableCell>
                      <TableCell>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className=&quot;text-right&quot;>
                        <Button
                          variant=&quot;ghost&quot;
                          size=&quot;sm&quot;
                          onClick={() =>
                            cancelInvitationMutation.mutate(invitation.id)
                          }
                          disabled={cancelInvitationMutation.isPending}
                          className=&quot;h-8 w-8 p-0&quot;
                        >
                          {cancelInvitationMutation.isPending ? (
                            <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
                          ) : (
                            <X className=&quot;h-4 w-4&quot; />
                          )}
                          <span className=&quot;sr-only&quot;>Cancel</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className=&quot;text-center py-6 text-muted-foreground"
                    >
                      No pending invitations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
