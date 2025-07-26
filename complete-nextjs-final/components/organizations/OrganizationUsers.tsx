"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { USER_ROLES } from "@/lib/constants";
import { apiRequest } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, UserPlus, X } from "lucide-react";

// Form validation schema for inviting users
const invitationFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string({ required_error: "Please select a role" }),
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
      email: "",
      role: "",
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
      return apiRequest("POST", "/api/organizations/invitations", {
        ...values,
        organizationId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
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
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  // Mutation for canceling invitations
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return apiRequest(
        "DELETE",
        `/api/organizations/invitations?id=${invitationId}`,
      );
    },
    onSuccess: () => {
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled successfully",
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
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    },
  });

  // Mutation for removing users from organization
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(
        "DELETE",
        `/api/organizations/users?userId=${userId}&organizationId=${organizationId}`,
      );
    },
    onSuccess: () => {
      toast({
        title: "User Removed",
        description:
          "The user has been removed from the organization successfully",
      });
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [`/api/organizations/users?organizationId=${organizationId}`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user",
        variant: "destructive",
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
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to format role names
  function formatRoleName(role: string) {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{organizationName} Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage users who have access to this organization
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
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
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
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
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendInvitationMutation.isPending}
                  >
                    {sendInvitationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Primary Organization</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users && usersData.users.length > 0 ? (
                  usersData.users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
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
                          <span className="text-green-600 font-medium">
                            Primary
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Secondary
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUserMutation.mutate(user.id)}
                          disabled={
                            user.is_primary || removeUserMutation.isPending
                          }
                          className="h-8 w-8 p-0"
                        >
                          {removeUserMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
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
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitationsData?.invitations &&
                Array.isArray(invitationsData.invitations) &&
                invitationsData.invitations.length > 0 ? (
                  invitationsData.invitations.map((invitation: Invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatRoleName(invitation.role)}</TableCell>
                      <TableCell>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            cancelInvitationMutation.mutate(invitation.id)
                          }
                          disabled={cancelInvitationMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          {cancelInvitationMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
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
