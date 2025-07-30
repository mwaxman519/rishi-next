"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit2,
  Shield,
  Users,
  Settings,
  Trash2,
  Search,
  Filter,
  Copy,
  Eye,
  UserPlus,
  Download,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  permissions: string[];
  defaultPermissions: string[];
  userCount: number;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
  autoAssignPermissions: boolean;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface CreateRoleForm {
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  defaultPermissions: string[];
  autoAssignPermissions: boolean;
}

const systemRoles: Role[] = [
  {
    id: "super_admin",
    name: "super_admin",
    displayName: "Super Admin",
    description: "Full system access with all administrative privileges",
    level: 100,
    isSystemRole: true,
    permissions: ["all"],
    defaultPermissions: ["all"],
    userCount: 3,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "organization_admin",
    name: "organization_admin",
    displayName: "Organization Admin",
    description: "Administrative access within specific organizations",
    level: 80,
    isSystemRole: true,
    permissions: ["org_admin", "user_management", "event_management"],
    defaultPermissions: [
      "org_admin",
      "user_management",
      "event_management",
      "reporting",
    ],
    userCount: 12,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "internal_field_manager",
    name: "internal_field_manager",
    displayName: "Internal Field Manager",
    description: "Manages field operations and staff assignments",
    level: 60,
    isSystemRole: true,
    permissions: ["field_management", "staff_assignment", "event_coordination"],
    defaultPermissions: [
      "field_management",
      "staff_assignment",
      "event_coordination",
      "location_management",
      "kit_management",
    ],
    userCount: 28,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "brand_agent",
    name: "brand_agent",
    displayName: "Brand Agent",
    description: "Represents brand interests in field operations",
    level: 40,
    isSystemRole: true,
    permissions: ["brand_events", "reporting"],
    defaultPermissions: ["brand_events", "reporting"],
    userCount: 156,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const availablePermissions: Permission[] = [
  {
    id: "all",
    name: "all",
    category: "System",
    description: "Full system access",
  },
  {
    id: "org_admin",
    name: "org_admin",
    category: "Organization",
    description: "Organization administration",
  },
  {
    id: "user_management",
    name: "user_management",
    category: "Users",
    description: "Manage users and roles",
  },
  {
    id: "event_management",
    name: "event_management",
    category: "Events",
    description: "Create and manage events",
  },
  {
    id: "field_management",
    name: "field_management",
    category: "Operations",
    description: "Manage field operations",
  },
  {
    id: "staff_assignment",
    name: "staff_assignment",
    category: "Operations",
    description: "Assign staff to events",
  },
  {
    id: "event_coordination",
    name: "event_coordination",
    category: "Events",
    description: "Coordinate event logistics",
  },
  {
    id: "brand_events",
    name: "brand_events",
    category: "Brand",
    description: "Manage brand-specific events",
  },
  {
    id: "reporting",
    name: "reporting",
    category: "Analytics",
    description: "View and generate reports",
  },
  {
    id: "location_management",
    name: "location_management",
    category: "Operations",
    description: "Manage locations and venues",
  },
  {
    id: "kit_management",
    name: "kit_management",
    category: "Operations",
    description: "Manage event kits and inventory",
  },
  {
    id: "billing_access",
    name: "billing_access",
    category: "Financial",
    description: "Access billing and payments",
  },
];

export default function RolesManagement() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(systemRoles);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(systemRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateRoleForm>({
    name: "",
    displayName: "",
    description: "",
    level: 50,
    permissions: [],
    defaultPermissions: [],
    autoAssignPermissions: true,
  });

  useEffect(() => {
    let filtered = roles;

    if (searchTerm) {
      filtered = filtered.filter(
        (role) =>
          role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((role) => {
        switch (levelFilter) {
          case "critical":
            return role.level >= 90;
          case "high":
            return role.level >= 70 && role.level < 90;
          case "moderate":
            return role.level >= 50 && role.level < 70;
          case "standard":
            return role.level < 50;
          default:
            return true;
        }
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((role) =>
        typeFilter === "system" ? role.isSystemRole : !role.isSystemRole,
      );
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm, levelFilter, typeFilter]);

  const handleCreateRole = () => {
    if (!createForm.name || !createForm.displayName) {
      toast({
        title: "Validation Error",
        description: "Role name and display name are required",
        variant: "destructive",
      });
      return;
    }

    const newRole: Role = {
      id: createForm.name.toLowerCase().replace(/\s+/g, "_"),
      name: createForm.name.toLowerCase().replace(/\s+/g, "_"),
      displayName: createForm.displayName,
      description: createForm.description,
      level: createForm.level,
      isSystemRole: false,
      permissions: createForm.permissions,
      defaultPermissions: createForm.defaultPermissions,
      autoAssignPermissions: createForm.autoAssignPermissions,
      userCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setRoles([...roles, newRole]);
    setCreateForm({
      name: "",
      displayName: "",
      description: "",
      level: 50,
      permissions: [],
      defaultPermissions: [],
      autoAssignPermissions: true,
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Role Created",
      description: `${newRole.displayName} role has been created successfully`,
    });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setCreateForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: role.permissions,
      defaultPermissions: role.defaultPermissions,
      autoAssignPermissions: role.autoAssignPermissions,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    const updatedRole = {
      ...selectedRole,
      displayName: createForm.displayName,
      description: createForm.description,
      level: createForm.level,
      permissions: createForm.permissions,
      updatedAt: new Date().toISOString(),
    };

    setRoles(
      roles.map((role) => (role.id === selectedRole.id ? updatedRole : role)),
    );
    setIsEditDialogOpen(false);
    setSelectedRole(null);

    toast({
      title: "Role Updated",
      description: `${updatedRole.displayName} role has been updated successfully`,
    });
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    setRoles(roles.filter((r) => r.id !== roleId));

    toast({
      title: "Role Deleted",
      description: `${role.displayName} role has been deleted successfully`,
    });
  };

  const handleDuplicateRole = (role: Role) => {
    const duplicatedRole: Role = {
      ...role,
      id: `${role.id}_copy`,
      name: `${role.name}_copy`,
      displayName: `${role.displayName} (Copy)`,
      isSystemRole: false,
      userCount: 0,
      createdAt: new Date().toISOString(),
    };

    setRoles([...roles, duplicatedRole]);

    toast({
      title: "Role Duplicated",
      description: `${duplicatedRole.displayName} has been created`,
    });
  };

  const handleTogglePermission = (permissionId: string) => {
    const updatedPermissions = createForm.permissions.includes(permissionId)
      ? createForm.permissions.filter((p) => p !== permissionId)
      : [...createForm.permissions, permissionId];

    setCreateForm({ ...createForm, permissions: updatedPermissions });
  };

  const handleToggleDefaultPermission = (permissionId: string) => {
    const updatedDefaultPermissions = createForm.defaultPermissions.includes(
      permissionId,
    )
      ? createForm.defaultPermissions.filter((p) => p !== permissionId)
      : [...createForm.defaultPermissions, permissionId];

    setCreateForm({
      ...createForm,
      defaultPermissions: updatedDefaultPermissions,
    });
  };

  const handleSetDefaultPermissions = (
    roleId: string,
    defaultPermissions: string[],
    autoAssign: boolean,
  ) => {
    const updatedRoles = roles.map((role) =>
      role.id === roleId
        ? {
            ...role,
            defaultPermissions,
            autoAssignPermissions: autoAssign,
            updatedAt: new Date().toISOString(),
          }
        : role,
    );
    setRoles(updatedRoles);

    toast({
      title: "Default Permissions Updated",
      description: "Role default permissions have been updated successfully",
    });
  };

  const getRoleLevelColor = (level: number) => {
    if (level >= 90)
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (level >= 70)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    if (level >= 50)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  const getRoleLevelText = (level: number) => {
    if (level >= 90) return "Critical";
    if (level >= 70) return "High";
    if (level >= 50) return "Moderate";
    return "Standard";
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    availablePermissions.forEach((permission) => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category]?.push(permission);
    });
    return categories;
  };

  const exportRoles = () => {
    const dataStr = JSON.stringify(roles, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "roles-export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Export Complete",
      description: "Roles data has been exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage system roles and their permissions across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRoles}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <CreateRoleDialog />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical (90+)</SelectItem>
                  <SelectItem value="high">High (70-89)</SelectItem>
                  <SelectItem value="moderate">Moderate (50-69)</SelectItem>
                  <SelectItem value="standard">Standard (<50)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRoles.length} of {roles.length} roles
        </p>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onDuplicate={handleDuplicateRole}
            onViewPermissions={() => {
              setSelectedRole(role);
              setIsPermissionsDialogOpen(true);
            }}
            onViewUsers={() => {
              setSelectedRole(role);
              setIsUsersDialogOpen(true);
            }}
            getRoleLevelColor={getRoleLevelColor}
            getRoleLevelText={getRoleLevelText}
          />
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No roles found</h3>
            <p className="text-muted-foreground mb-4">
              No roles match your current search and filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setLevelFilter("all");
                setTypeFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <EditRoleDialog role={selectedRole} />
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      >
        <PermissionsDialog role={selectedRole} />
      </Dialog>

      {/* Users Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <UsersDialog role={selectedRole} />
      </Dialog>
    </div>
  );

  function CreateRoleDialog() {
    const permissionCategories = getPermissionsByCategory();

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new role with specific permissions and access levels
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g., regional_manager"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase, underscores only. Used internally.
              </p>
            </div>
            <div>
              <Label htmlFor="display-name">Display Name *</Label>
              <Input
                id="display-name"
                placeholder="e.g., Regional Manager"
                value={createForm.displayName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role's responsibilities..."
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="access-level">
                Access Level: {createForm.level}
              </Label>
              <Input
                id="access-level"
                type="range"
                min="1"
                max="100"
                value={createForm.level}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    level: parseInt(e.target.value),
                  })
                }
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Standard (1)</span>
                <span>Critical (100)</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="permissions" className="space-y-4">
            <ScrollArea className="h-[300px]">
              {Object.entries(permissionCategories).map(
                ([category, permissions]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-2 pl-4">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={createForm.permissions.includes(
                              permission.id,
                            )}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.id)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={permission.id}
                              className="text-sm font-medium"
                            >
                              {permission.name.replace(/_/g, " ")}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsCreateDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateRole}>Create Role</Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  function EditRoleDialog({ role }: { role: Role | null }) {
    if (!role) return null;

    const permissionCategories = getPermissionsByCategory();

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.displayName}</DialogTitle>
          <DialogDescription>
            Update role details and permissions
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="edit-display-name">Display Name</Label>
              <Input
                id="edit-display-name"
                value={createForm.displayName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, displayName: e.target.value })
                }
                disabled={role.isSystemRole}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                disabled={role.isSystemRole}
              />
            </div>
            <div>
              <Label htmlFor="edit-access-level">
                Access Level: {createForm.level}
              </Label>
              <Input
                id="edit-access-level"
                type="range"
                min="1"
                max="100"
                value={createForm.level}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    level: parseInt(e.target.value),
                  })
                }
                disabled={role.isSystemRole}
                className="mt-2"
              />
            </div>
          </TabsContent>
          <TabsContent value="permissions" className="space-y-4">
            <ScrollArea className="h-[300px]">
              {Object.entries(permissionCategories).map(
                ([category, permissions]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-2 pl-4">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-2"
                        >
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={createForm.permissions.includes(
                              permission.id,
                            )}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.id)
                            }
                            disabled={role.isSystemRole}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={`edit-${permission.id}`}
                              className="text-sm font-medium"
                            >
                              {permission.name.replace(/_/g, " ")}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} disabled={role.isSystemRole}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  function PermissionsDialog({ role }: { role: Role | null }) {
    if (!role) return null;

    const permissionCategories = getPermissionsByCategory();
    const rolePermissions = availablePermissions.filter((p) =>
      role.permissions.includes(p.id),
    );

    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{role.displayName} Permissions</DialogTitle>
          <DialogDescription>
            View all permissions assigned to this role
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {Object.entries(permissionCategories).map(
              ([category, permissions]) => {
                const categoryPermissions = permissions.filter((p) =>
                  role.permissions.includes(p.id),
                );
                if (categoryPermissions.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-1 pl-4">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="text-sm">
                          <div className="font-medium">
                            {permission.name.replace(/_/g, " ")}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {permission.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsPermissionsDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  function UsersDialog({ role }: { role: Role | null }) {
    if (!role) return null;

    // Mock users for demonstration
    const mockUsers: User[] = Array.from(
      { length: role.userCount },
      (_, i) => ({
        id: `user-${i + 1}`,
        email: `user${i + 1}@example.com`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        role: role.name,
      }),
    );

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Users with {role.displayName} Role</DialogTitle>
          <DialogDescription>
            {role.userCount} users are assigned to this role
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search users..." className="max-w-sm" />
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Users
            </Button>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {mockUsers.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }
}

function RoleCard({
  role,
  onEdit,
  onDelete,
  onDuplicate,
  onViewPermissions,
  onViewUsers,
  getRoleLevelColor,
  getRoleLevelText,
}: {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onDuplicate: (role: Role) => void;
  onViewPermissions: () => void;
  onViewUsers: () => void;
  getRoleLevelColor: (level: number) => string;
  getRoleLevelText: (level: number) => string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-xl">{role.displayName}</CardTitle>
              <CardDescription className="text-sm font-mono text-muted-foreground">
                {role.name}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={role.isSystemRole ? "secondary" : "outline"}>
              {role.isSystemRole ? "System Role" : "Custom Role"}
            </Badge>
            <Badge className={getRoleLevelColor(role.level)}>
              Level {role.level} - {getRoleLevelText(role.level)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{role.description}</p>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={onViewUsers}
                  className="text-sm font-medium hover:underline"
                >
                  {role.userCount} users
                </button>
              </div>
              {role.createdAt && (
                <div className="text-xs text-muted-foreground">
                  Created {new Date(role.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={onViewPermissions}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(role)}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicate(role)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
              {!role.isSystemRole && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the "{role.displayName}"
                        role? This action cannot be undone and will affect{" "}
                        {role.userCount} users.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(role.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Role
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              PERMISSIONS
            </Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {role.permissions.slice(0, 4).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission.replace(/_/g, " ")}
                </Badge>
              ))}
              {role.permissions.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
