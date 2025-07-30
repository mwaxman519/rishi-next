&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { AlertCircle, ArrowLeft, Save } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from &quot;@/components/ui/tabs-fixed&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Example permission structure
// In a real implementation, these would come from the API
const PERMISSION_CATEGORIES = [
  {
    id: &quot;users&quot;,
    name: &quot;User Management&quot;,
    permissions: [
      { id: &quot;create:users&quot;, name: &quot;Create Users&quot; },
      { id: &quot;read:users&quot;, name: &quot;View Users&quot; },
      { id: &quot;update:users&quot;, name: &quot;Edit Users&quot; },
      { id: &quot;delete:users&quot;, name: &quot;Delete Users&quot; },
    ],
  },
  {
    id: &quot;organizations&quot;,
    name: &quot;Organization Management&quot;,
    permissions: [
      { id: &quot;create:organizations&quot;, name: &quot;Create Organizations&quot; },
      { id: &quot;read:organizations&quot;, name: &quot;View Organizations&quot; },
      { id: &quot;update:organizations&quot;, name: &quot;Edit Organizations&quot; },
      { id: &quot;delete:organizations&quot;, name: &quot;Delete Organizations&quot; },
    ],
  },
  {
    id: &quot;features&quot;,
    name: &quot;Feature Management&quot;,
    permissions: [
      { id: &quot;manage:features&quot;, name: &quot;Manage Features&quot; },
      { id: &quot;assign:features&quot;, name: &quot;Assign Features to Organizations&quot; },
    ],
  },
  {
    id: &quot;system&quot;,
    name: &quot;System Management&quot;,
    permissions: [
      { id: &quot;edit:system_config&quot;, name: &quot;Edit System Configuration&quot; },
      { id: &quot;view:audit_logs&quot;, name: &quot;View Audit Logs&quot; },
      { id: &quot;edit:permissions&quot;, name: &quot;Edit Role Permissions&quot; },
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
            &quot;edit:system_config&quot;,
            &quot;edit:permissions&quot;,
            &quot;delete:organizations&quot;,
          ].includes(p.id),
      )
      .map((p) => p.id),
  ),
  internal_field_manager: [
    &quot;read:users&quot;,
    &quot;create:users&quot;,
    &quot;update:users&quot;,
    &quot;read:organizations&quot;,
  ],
  field_coordinator: [&quot;read:users&quot;, &quot;read:organizations&quot;],
  brand_agent: [&quot;read:organizations&quot;],
  client_manager: [
    &quot;read:users&quot;,
    &quot;create:users&quot;,
    &quot;update:users&quot;,
    &quot;read:organizations&quot;,
  ],
  client_user: [&quot;read:organizations&quot;],
};

export default function UserPermissionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState(&quot;super_admin&quot;);
  const [rolePermissions, setRolePermissions] =
    useState<Record<string, string[]>>(ROLE_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for super admin access
  const isSuperAdmin = user?.role === &quot;super_admin&quot;;

  // Handle toggling a permission for a role
  const togglePermission = (permissionId: string) => {
    setRolePermissions((prev) => {
      const newPermissions = { ...prev };

      // Ensure the selectedRole exists in permissions
      if (!newPermissions[selectedRole]) {
        newPermissions[selectedRole] = [];
      }

      if (newPermissions[selectedRole]?.includes(permissionId)) {
        // Remove the permission
        newPermissions[selectedRole] = newPermissions[selectedRole].filter(
          (id) => id !== permissionId,
        );
      } else {
        // Add the permission
        newPermissions[selectedRole] = [
          ...(newPermissions[selectedRole] || []),
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
        title: &quot;Permissions Updated&quot;,
        description: `Permissions for ${selectedRole} role have been updated successfully.`,
        variant: &quot;default&quot;,
      });

      setHasChanges(false);
    } catch (error) {
      console.error(&quot;Error saving permissions:&quot;, error);

      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to update permissions. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className=&quot;flex justify-center items-center min-h-screen&quot;>
        <div className=&quot;animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary&quot;></div>
      </div>
    );
  }

  // Only super admin can manage permissions
  if (!isSuperAdmin) {
    return (
      <div className=&quot;p-6&quot;>
        <Alert variant=&quot;destructive&quot; className=&quot;mb-6&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only super administrators can manage role permissions.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push(&quot;/admin/users&quot;)} variant=&quot;outline&quot;>
          Return to Users
        </Button>
      </div>
    );
  }

  return (
    <div className=&quot;p-4 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-2xl font-bold&quot;>User Role Permissions</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Manage what each role can do in the system
          </p>
        </div>
        <Button variant=&quot;outline&quot; onClick={() => router.push(&quot;/admin/users&quot;)}>
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
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
            className=&quot;w-full&quot;
          >
            <TabsList className=&quot;mb-4&quot;>
              <TabsTrigger value=&quot;super_admin&quot;>Super Admin</TabsTrigger>
              <TabsTrigger value=&quot;internal_admin&quot;>Internal Admin</TabsTrigger>
              <TabsTrigger value=&quot;internal_field_manager&quot;>
                Field Manager
              </TabsTrigger>
              <TabsTrigger value=&quot;field_coordinator&quot;>
                Field Coordinator
              </TabsTrigger>
              <TabsTrigger value=&quot;brand_agent&quot;>Brand Agent</TabsTrigger>
              <TabsTrigger value=&quot;client_manager&quot;>Client Manager</TabsTrigger>
              <TabsTrigger value=&quot;client_user&quot;>Client User</TabsTrigger>
            </TabsList>

            {/* The content is the same for all tabs, we just filter the permissions based on the selected role */}
            <div className=&quot;space-y-8&quot;>
              {PERMISSION_CATEGORIES.map((category) => (
                <div key={category.id} className=&quot;space-y-4&quot;>
                  <h3 className=&quot;text-lg font-medium&quot;>{category.name}</h3>
                  <Separator />

                  <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                    {category.permissions.map((permission) => {
                      const isEnabled = Boolean(rolePermissions[selectedRole]?.includes(
                        permission.id,
                      ));
                      // Super admin always has all permissions and they can&apos;t be changed
                      const isDisabled = selectedRole === &quot;super_admin&quot;;

                      return (
                        <div
                          key={permission.id}
                          className=&quot;flex items-center justify-between p-3 border rounded-md&quot;
                        >
                          <div>
                            <p className=&quot;font-medium&quot;>{permission.name}</p>
                            <p className=&quot;text-sm text-muted-foreground&quot;>
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

          <div className=&quot;mt-8 flex justify-end&quot;>
            <Button
              onClick={savePermissions}
              disabled={
                !hasChanges || isSubmitting || selectedRole === &quot;super_admin&quot;
              }
            >
              {isSubmitting ? (
                <>
                  <div className=&quot;animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full&quot;></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className=&quot;mr-2 h-4 w-4&quot; />
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
