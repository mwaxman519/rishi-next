&quot;use client&quot;;

/**
 * Organization Permissions Admin Page
 *
 * This page allows administrators to manage organization-specific permission overrides.
 * It provides:
 * 1. A list of all organizations
 * 2. The ability to select an organization and view its custom permissions
 * 3. A way to add/remove/edit permission overrides for each organization
 */

import { useState, useEffect } from &quot;react&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { PermissionGuard } from &quot;@/components/rbac/PermissionGuard&quot;;

// Define types for the component
interface Organization {
  id: number;
  name: string;
  type: &quot;internal&quot; | &quot;client&quot; | &quot;partner&quot;;
  tier?: &quot;tier_1&quot; | &quot;tier_2&quot; | &quot;tier_3&quot;;
}

interface Permission {
  name: string;
  description: string;
}

interface OrganizationPermission {
  name: string;
  allowed: boolean;
}

export default function OrganizationPermissionsPage() {
  // State for organizations and permissions
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("&quot;);
  const [orgPermissions, setOrgPermissions] = useState<
    OrganizationPermission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState(&quot;&quot;);

  // Get toast hook for notifications
  const { toast } = useToast();

  // Fetch organizations on component mount
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch(&quot;/api/organizations&quot;);
        if (!response.ok) {
          throw new Error(&quot;Failed to fetch organizations&quot;);
        }
        const data = await response.json();
        setOrganizations(data);
        setLoading(false);
      } catch (error) {
        console.error(&quot;Error fetching organizations:&quot;, error);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to load organizations. Please try again.&quot;,
          variant: &quot;destructive&quot;,
        });
        setLoading(false);
      }
    }

    async function fetchAvailablePermissions() {
      try {
        const response = await fetch(&quot;/api/rbac/permissions&quot;);
        if (!response.ok) {
          throw new Error(&quot;Failed to fetch permissions&quot;);
        }
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error(&quot;Error fetching permissions:&quot;, error);
        toast({
          title: &quot;Error&quot;,
          description:
            &quot;Failed to load available permissions. Please try again.&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    fetchOrganizations();
    fetchAvailablePermissions();
  }, [toast]);

  // Fetch organization permissions when an organization is selected
  useEffect(() => {
    if (!selectedOrgId) return;

    async function fetchOrgPermissions() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/rbac/organization-permissions?organizationId=${selectedOrgId}`,
        );
        if (!response.ok) {
          throw new Error(&quot;Failed to fetch organization permissions&quot;);
        }
        const allowedPermissions = await response.json();

        // Convert to the format needed for the UI
        const formattedPermissions = permissions.map((perm) => ({
          name: perm.name,
          allowed: allowedPermissions.includes(perm.name),
        }));

        setOrgPermissions(formattedPermissions);
        setLoading(false);
      } catch (error) {
        console.error(&quot;Error fetching organization permissions:&quot;, error);
        toast({
          title: &quot;Error&quot;,
          description:
            &quot;Failed to load organization permissions. Please try again.&quot;,
          variant: &quot;destructive&quot;,
        });
        setLoading(false);
      }
    }

    fetchOrgPermissions();
  }, [selectedOrgId, permissions, toast]);

  // Save permission changes
  const savePermissions = async () => {
    if (!selectedOrgId) return;

    try {
      setSaving(true);

      const response = await fetch(&quot;/api/rbac/organization-permissions&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          organizationId: parseInt(selectedOrgId),
          permissions: orgPermissions,
        }),
      });

      if (!response.ok) {
        throw new Error(&quot;Failed to save permissions&quot;);
      }

      toast({
        title: &quot;Success&quot;,
        description: &quot;Organization permissions have been updated.&quot;,
        variant: &quot;default&quot;,
      });
    } catch (error) {
      console.error(&quot;Error saving permissions:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to save permissions. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionName: string, allowed: boolean) => {
    setOrgPermissions((prev) =>
      prev.map((perm) =>
        perm.name === permissionName ? { ...perm, allowed } : perm,
      ),
    );
  };

  // Add a new custom permission
  const addCustomPermission = () => {
    if (!newPermissionName.trim()) {
      toast({
        title: &quot;Error&quot;,
        description: &quot;Please enter a permission name.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    // Check if permission already exists
    if (orgPermissions.some((p) => p.name === newPermissionName)) {
      toast({
        title: &quot;Error&quot;,
        description: &quot;This permission already exists.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setOrgPermissions((prev) => [
      ...prev,
      { name: newPermissionName, allowed: true },
    ]);

    setNewPermissionName(&quot;&quot;);

    toast({
      title: &quot;Success&quot;,
      description:
        &quot;Custom permission added. Don't forget to save your changes.&quot;,
      variant: &quot;default&quot;,
    });
  };

  return (
    <PermissionGuard permission=&quot;admin:permissions&quot;>
      <div className=&quot;container mx-auto py-8&quot;>
        <h1 className=&quot;text-3xl font-bold mb-8&quot;>
          Organization Permissions Management
        </h1>

        <Card className=&quot;mb-8&quot;>
          <CardHeader>
            <CardTitle>Organization Selection</CardTitle>
            <CardDescription>
              Select an organization to manage its permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;grid w-full items-center gap-4&quot;>
              <div className=&quot;flex flex-col space-y-1.5&quot;>
                <Label htmlFor=&quot;organization&quot;>Organization</Label>
                <Select
                  value={selectedOrgId}
                  onValueChange={setSelectedOrgId}
                  disabled={loading || organizations.length === 0}
                >
                  <SelectTrigger id=&quot;organization&quot;>
                    <SelectValue placeholder=&quot;Select an organization&quot; />
                  </SelectTrigger>
                  <SelectContent position=&quot;popper&quot;>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name} ({org.type} {org.tier ? `- ${org.tier}` : &quot;&quot;}
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedOrgId && (
          <Card>
            <CardHeader>
              <CardTitle>
                Permission Management for{&quot; &quot;}
                {
                  organizations.find((o) => o.id.toString() === selectedOrgId)
                    ?.name
                }
              </CardTitle>
              <CardDescription>
                Configure organization-specific permission overrides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue=&quot;standard&quot;>
                <TabsList className=&quot;mb-4&quot;>
                  <TabsTrigger value=&quot;standard&quot;>
                    Standard Permissions
                  </TabsTrigger>
                  <TabsTrigger value=&quot;custom&quot;>Custom Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value=&quot;standard&quot;>
                  <div className=&quot;border rounded-md&quot;>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className=&quot;w-[150px] text-center&quot;>
                            Allowed
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={3} className=&quot;text-center py-4&quot;>
                              Loading permissions...
                            </TableCell>
                          </TableRow>
                        ) : orgPermissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className=&quot;text-center py-4&quot;>
                              No permissions found for this organization.
                            </TableCell>
                          </TableRow>
                        ) : (
                          orgPermissions.map((perm) => {
                            // Find the permission details
                            const permDetails = permissions.find(
                              (p) => p.name === perm.name,
                            );
                            // Only show standard permissions (ones with descriptions)
                            if (!permDetails) return null;

                            return (
                              <TableRow key={perm.name}>
                                <TableCell className=&quot;font-medium&quot;>
                                  {perm.name}
                                </TableCell>
                                <TableCell>{permDetails.description}</TableCell>
                                <TableCell className=&quot;text-center&quot;>
                                  <Switch
                                    checked={perm.allowed}
                                    onCheckedChange={(checked) =>
                                      handlePermissionToggle(perm.name, checked)
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value=&quot;custom&quot;>
                  <div className=&quot;space-y-6&quot;>
                    <div className=&quot;flex items-end gap-2&quot;>
                      <div className=&quot;flex-1 space-y-1.5&quot;>
                        <Label htmlFor=&quot;new-permission&quot;>
                          Add Custom Permission
                        </Label>
                        <Input
                          id=&quot;new-permission&quot;
                          placeholder=&quot;e.g., view:custom-resource&quot;
                          value={newPermissionName}
                          onChange={(e) => setNewPermissionName(e.target.value)}
                        />
                      </div>
                      <Button onClick={addCustomPermission}>Add</Button>
                    </div>

                    <div className=&quot;border rounded-md&quot;>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Custom Permission</TableHead>
                            <TableHead className=&quot;w-[150px] text-center&quot;>
                              Allowed
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={2}
                                className=&quot;text-center py-4&quot;
                              >
                                Loading custom permissions...
                              </TableCell>
                            </TableRow>
                          ) : (
                            orgPermissions
                              .filter(
                                (perm) =>
                                  !permissions.some(
                                    (p) => p.name === perm.name,
                                  ),
                              )
                              .map((perm) => (
                                <TableRow key={perm.name}>
                                  <TableCell className=&quot;font-medium&quot;>
                                    {perm.name}
                                  </TableCell>
                                  <TableCell className=&quot;text-center&quot;>
                                    <Switch
                                      checked={perm.allowed}
                                      onCheckedChange={(checked) =>
                                        handlePermissionToggle(
                                          perm.name,
                                          checked,
                                        )
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                          {!loading &&
                            orgPermissions.filter(
                              (perm) =>
                                !permissions.some((p) => p.name === perm.name),
                            ).length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={2}
                                  className=&quot;text-center py-4&quot;
                                >
                                  No custom permissions added yet.
                                </TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className=&quot;mt-6 flex justify-end&quot;>
                <Button
                  onClick={savePermissions}
                  disabled={saving || !selectedOrgId}
                >
                  {saving ? &quot;Saving...&quot; : &quot;Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
