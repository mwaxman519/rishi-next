"use client";

/**
 * Organization Permissions Admin Page
 *
 * This page allows administrators to manage organization-specific permission overrides.
 * It provides:
 * 1. A list of all organizations
 * 2. The ability to select an organization and view its custom permissions
 * 3. A way to add/remove/edit permission overrides for each organization
 */

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/rbac/PermissionGuard";

// Define types for the component
interface Organization {
  id: number;
  name: string;
  type: "internal" | "client" | "partner";
  tier?: "tier_1" | "tier_2" | "tier_3";
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
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [orgPermissions, setOrgPermissions] = useState<
    OrganizationPermission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");

  // Get toast hook for notifications
  const { toast } = useToast();

  // Fetch organizations on component mount
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setOrganizations(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast({
          title: "Error",
          description: "Failed to load organizations. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    }

    async function fetchAvailablePermissions() {
      try {
        const response = await fetch("/api/rbac/permissions");
        if (!response.ok) {
          throw new Error("Failed to fetch permissions");
        }
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast({
          title: "Error",
          description:
            "Failed to load available permissions. Please try again.",
          variant: "destructive",
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
          throw new Error("Failed to fetch organization permissions");
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
        console.error("Error fetching organization permissions:", error);
        toast({
          title: "Error",
          description:
            "Failed to load organization permissions. Please try again.",
          variant: "destructive",
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

      const response = await fetch("/api/rbac/organization-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: parseInt(selectedOrgId),
          permissions: orgPermissions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save permissions");
      }

      toast({
        title: "Success",
        description: "Organization permissions have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
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
        title: "Error",
        description: "Please enter a permission name.",
        variant: "destructive",
      });
      return;
    }

    // Check if permission already exists
    if (orgPermissions.some((p) => p.name === newPermissionName)) {
      toast({
        title: "Error",
        description: "This permission already exists.",
        variant: "destructive",
      });
      return;
    }

    setOrgPermissions((prev) => [
      ...prev,
      { name: newPermissionName, allowed: true },
    ]);

    setNewPermissionName("");

    toast({
      title: "Success",
      description:
        "Custom permission added. Don't forget to save your changes.",
      variant: "default",
    });
  };

  return (
    <PermissionGuard permission="admin:permissions">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">
          Organization Permissions Management
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Organization Selection</CardTitle>
            <CardDescription>
              Select an organization to manage its permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={selectedOrgId}
                  onValueChange={setSelectedOrgId}
                  disabled={loading || organizations.length === 0}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name} ({org.type} {org.tier ? `- ${org.tier}` : ""}
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
                Permission Management for{" "}
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
              <Tabs defaultValue="standard">
                <TabsList className="mb-4">
                  <TabsTrigger value="standard">
                    Standard Permissions
                  </TabsTrigger>
                  <TabsTrigger value="custom">Custom Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="standard">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[150px] text-center">
                            Allowed
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              Loading permissions...
                            </TableCell>
                          </TableRow>
                        ) : orgPermissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
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
                                <TableCell className="font-medium">
                                  {perm.name}
                                </TableCell>
                                <TableCell>{permDetails.description}</TableCell>
                                <TableCell className="text-center">
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

                <TabsContent value="custom">
                  <div className="space-y-6">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor="new-permission">
                          Add Custom Permission
                        </Label>
                        <Input
                          id="new-permission"
                          placeholder="e.g., view:custom-resource"
                          value={newPermissionName}
                          onChange={(e) => setNewPermissionName(e.target.value)}
                        />
                      </div>
                      <Button onClick={addCustomPermission}>Add</Button>
                    </div>

                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Custom Permission</TableHead>
                            <TableHead className="w-[150px] text-center">
                              Allowed
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={2}
                                className="text-center py-4"
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
                                  <TableCell className="font-medium">
                                    {perm.name}
                                  </TableCell>
                                  <TableCell className="text-center">
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
                                  className="text-center py-4"
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

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={savePermissions}
                  disabled={saving || !selectedOrgId}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
