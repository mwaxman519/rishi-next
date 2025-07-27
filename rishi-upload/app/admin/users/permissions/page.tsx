"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-fixed";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Example permission structure
// In a real implementation, these would come from the API
const PERMISSION_CATEGORIES = [
  {
    id: "users",
    name: "User Management",
    permissions: [
      { id: "create:users", name: "Create Users" },
      { id: "read:users", name: "View Users" },
      { id: "update:users", name: "Edit Users" },
      { id: "delete:users", name: "Delete Users" },
    ],
  },
  {
    id: "organizations",
    name: "Organization Management",
    permissions: [
      { id: "create:organizations", name: "Create Organizations" },
      { id: "read:organizations", name: "View Organizations" },
      { id: "update:organizations", name: "Edit Organizations" },
      { id: "delete:organizations", name: "Delete Organizations" },
    ],
  },
  {
    id: "features",
    name: "Feature Management",
    permissions: [
      { id: "manage:features", name: "Manage Features" },
      { id: "assign:features", name: "Assign Features to Organizations" },
    ],
  },
  {
    id: "system",
    name: "System Management",
    permissions: [
      { id: "edit:system_config", name: "Edit System Configuration" },
      { id: "view:audit_logs", name: "View Audit Logs" },
      { id: "edit:permissions", name: "Edit Role Permissions" },
    ],
  },
];

// Example role permissions mappings
// In a real implementation, these would come from the API
const ROLE_PERMISSIONS = {
  super_admin: PERMISSION_CATEGORIES.flatMap((cat) =>
    cat.permissions.map((p) => p.id),
  ),
  internal_admin: PERMISSION_CATEGORIES.flatMap((cat) =>
    cat.permissions
      .filter(
        (p) =>
          ![
            "edit:system_config",
            "edit:permissions",
            "delete:organizations",
          ].includes(p.id),
      )
      .map((p) => p.id),
  ),
  internal_field_manager: [
    "read:users",
    "create:users",
    "update:users",
    "read:organizations",
  ],
  field_coordinator: ["read:users", "read:organizations"],
  brand_agent: ["read:organizations"],
  client_manager: [
    "read:users",
    "create:users",
    "update:users",
    "read:organizations",
  ],
  client_user: ["read:organizations"],
};

export default function UserPermissionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("super_admin");
  const [rolePermissions, setRolePermissions] =
    useState<Record<string, string[]>>(ROLE_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for super admin access
  const isSuperAdmin = user?.role === "super_admin";

  // Handle toggling a permission for a role
  const togglePermission = (permissionId: string) => {
    setRolePermissions((prev) => {
      const newPermissions = { ...prev };

      if (newPermissions[selectedRole].includes(permissionId)) {
        // Remove the permission
        newPermissions[selectedRole] = newPermissions[selectedRole].filter(
          (id) => id !== permissionId,
        );
      } else {
        // Add the permission
        newPermissions[selectedRole] = [
          ...newPermissions[selectedRole],
          permissionId,
        ];
      }

      setHasChanges(true);
      return newPermissions;
    });
  };

  // Handle saving permission changes
  const savePermissions = async () => {
    setIsSubmitting(true);

    try {
      // In a real implementation, we would call the API to save the permissions
      // await updateRolePermissions(selectedRole, rolePermissions[selectedRole]);

      toast({
        title: "Permissions Updated",
        description: `Permissions for ${selectedRole} role have been updated successfully.`,
        variant: "default",
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving permissions:", error);

      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only super admin can manage permissions
  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only super administrators can manage role permissions.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/admin/users")} variant="outline">
          Return to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Role Permissions</h1>
          <p className="text-muted-foreground">
            Manage what each role can do in the system
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Management</CardTitle>
          <CardDescription>
            Configure which permissions are assigned to each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedRole}
            onValueChange={setSelectedRole}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="super_admin">Super Admin</TabsTrigger>
              <TabsTrigger value="internal_admin">Internal Admin</TabsTrigger>
              <TabsTrigger value="internal_field_manager">
                Field Manager
              </TabsTrigger>
              <TabsTrigger value="field_coordinator">
                Field Coordinator
              </TabsTrigger>
              <TabsTrigger value="brand_agent">Brand Agent</TabsTrigger>
              <TabsTrigger value="client_manager">Client Manager</TabsTrigger>
              <TabsTrigger value="client_user">Client User</TabsTrigger>
            </TabsList>

            {/* The content is the same for all tabs, we just filter the permissions based on the selected role */}
            <div className="space-y-8">
              {PERMISSION_CATEGORIES.map((category) => (
                <div key={category.id} className="space-y-4">
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.permissions.map((permission) => {
                      const isEnabled = rolePermissions[selectedRole]?.includes(
                        permission.id,
                      );
                      // Super admin always has all permissions and they can't be changed
                      const isDisabled = selectedRole === "super_admin";

                      return (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {permission.id}
                            </p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() =>
                              togglePermission(permission.id)
                            }
                            disabled={isDisabled}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={savePermissions}
              disabled={
                !hasChanges || isSubmitting || selectedRole === "super_admin"
              }
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Permission Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
