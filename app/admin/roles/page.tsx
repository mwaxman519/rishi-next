&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
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
} from &quot;@/components/ui/alert-dialog&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { ScrollArea } from &quot;@/components/ui/scroll-area&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
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
} from &quot;lucide-react&quot;;

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
    id: &quot;super_admin&quot;,
    name: &quot;super_admin&quot;,
    displayName: &quot;Super Admin&quot;,
    description: &quot;Full system access with all administrative privileges&quot;,
    level: 100,
    isSystemRole: true,
    permissions: [&quot;all&quot;],
    defaultPermissions: [&quot;all&quot;],
    userCount: 3,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: &quot;2024-01-01T00:00:00Z&quot;,
  },
  {
    id: &quot;organization_admin&quot;,
    name: &quot;organization_admin&quot;,
    displayName: &quot;Organization Admin&quot;,
    description: &quot;Administrative access within specific organizations&quot;,
    level: 80,
    isSystemRole: true,
    permissions: [&quot;org_admin&quot;, &quot;user_management&quot;, &quot;event_management&quot;],
    defaultPermissions: [
      &quot;org_admin&quot;,
      &quot;user_management&quot;,
      &quot;event_management&quot;,
      &quot;reporting&quot;,
    ],
    userCount: 12,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: &quot;2024-01-01T00:00:00Z&quot;,
  },
  {
    id: &quot;internal_field_manager&quot;,
    name: &quot;internal_field_manager&quot;,
    displayName: &quot;Internal Field Manager&quot;,
    description: &quot;Manages field operations and staff assignments&quot;,
    level: 60,
    isSystemRole: true,
    permissions: [&quot;field_management&quot;, &quot;staff_assignment&quot;, &quot;event_coordination&quot;],
    defaultPermissions: [
      &quot;field_management&quot;,
      &quot;staff_assignment&quot;,
      &quot;event_coordination&quot;,
      &quot;location_management&quot;,
      &quot;kit_management&quot;,
    ],
    userCount: 28,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: &quot;2024-01-01T00:00:00Z&quot;,
  },
  {
    id: &quot;brand_agent&quot;,
    name: &quot;brand_agent&quot;,
    displayName: &quot;Brand Agent&quot;,
    description: &quot;Represents brand interests in field operations&quot;,
    level: 40,
    isSystemRole: true,
    permissions: [&quot;brand_events&quot;, &quot;reporting&quot;],
    defaultPermissions: [&quot;brand_events&quot;, &quot;reporting&quot;],
    userCount: 156,
    isActive: true,
    autoAssignPermissions: true,
    createdAt: &quot;2024-01-01T00:00:00Z&quot;,
  },
];

const availablePermissions: Permission[] = [
  {
    id: &quot;all&quot;,
    name: &quot;all&quot;,
    category: &quot;System&quot;,
    description: &quot;Full system access&quot;,
  },
  {
    id: &quot;org_admin&quot;,
    name: &quot;org_admin&quot;,
    category: &quot;Organization&quot;,
    description: &quot;Organization administration&quot;,
  },
  {
    id: &quot;user_management&quot;,
    name: &quot;user_management&quot;,
    category: &quot;Users&quot;,
    description: &quot;Manage users and roles&quot;,
  },
  {
    id: &quot;event_management&quot;,
    name: &quot;event_management&quot;,
    category: &quot;Events&quot;,
    description: &quot;Create and manage events&quot;,
  },
  {
    id: &quot;field_management&quot;,
    name: &quot;field_management&quot;,
    category: &quot;Operations&quot;,
    description: &quot;Manage field operations&quot;,
  },
  {
    id: &quot;staff_assignment&quot;,
    name: &quot;staff_assignment&quot;,
    category: &quot;Operations&quot;,
    description: &quot;Assign staff to events&quot;,
  },
  {
    id: &quot;event_coordination&quot;,
    name: &quot;event_coordination&quot;,
    category: &quot;Events&quot;,
    description: &quot;Coordinate event logistics&quot;,
  },
  {
    id: &quot;brand_events&quot;,
    name: &quot;brand_events&quot;,
    category: &quot;Brand&quot;,
    description: &quot;Manage brand-specific events&quot;,
  },
  {
    id: &quot;reporting&quot;,
    name: &quot;reporting&quot;,
    category: &quot;Analytics&quot;,
    description: &quot;View and generate reports&quot;,
  },
  {
    id: &quot;location_management&quot;,
    name: &quot;location_management&quot;,
    category: &quot;Operations&quot;,
    description: &quot;Manage locations and venues&quot;,
  },
  {
    id: &quot;kit_management&quot;,
    name: &quot;kit_management&quot;,
    category: &quot;Operations&quot;,
    description: &quot;Manage event kits and inventory&quot;,
  },
  {
    id: &quot;billing_access&quot;,
    name: &quot;billing_access&quot;,
    category: &quot;Financial&quot;,
    description: &quot;Access billing and payments&quot;,
  },
];

export default function RolesManagement() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(systemRoles);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(systemRoles);
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [levelFilter, setLevelFilter] = useState<string>(&quot;all&quot;);
  const [typeFilter, setTypeFilter] = useState<string>(&quot;all&quot;);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateRoleForm>({
    name: &quot;&quot;,
    displayName: &quot;&quot;,
    description: &quot;&quot;,
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

    if (levelFilter !== &quot;all&quot;) {
      filtered = filtered.filter((role) => {
        switch (levelFilter) {
          case &quot;critical&quot;:
            return role.level >= 90;
          case &quot;high&quot;:
            return role.level >= 70 && role.level < 90;
          case &quot;moderate&quot;:
            return role.level >= 50 && role.level < 70;
          case &quot;standard&quot;:
            return role.level < 50;
          default:
            return true;
        }
      });
    }

    if (typeFilter !== &quot;all&quot;) {
      filtered = filtered.filter((role) =>
        typeFilter === &quot;system&quot; ? role.isSystemRole : !role.isSystemRole,
      );
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm, levelFilter, typeFilter]);

  const handleCreateRole = () => {
    if (!createForm.name || !createForm.displayName) {
      toast({
        title: &quot;Validation Error&quot;,
        description: &quot;Role name and display name are required&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    const newRole: Role = {
      id: createForm.name.toLowerCase().replace(/\s+/g, &quot;_&quot;),
      name: createForm.name.toLowerCase().replace(/\s+/g, &quot;_&quot;),
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
      name: &quot;&quot;,
      displayName: &quot;&quot;,
      description: &quot;&quot;,
      level: 50,
      permissions: [],
      defaultPermissions: [],
      autoAssignPermissions: true,
    });
    setIsCreateDialogOpen(false);

    toast({
      title: &quot;Role Created&quot;,
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
      title: &quot;Role Updated&quot;,
      description: `${updatedRole.displayName} role has been updated successfully`,
    });
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    setRoles(roles.filter((r) => r.id !== roleId));

    toast({
      title: &quot;Role Deleted&quot;,
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
      title: &quot;Role Duplicated&quot;,
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
      title: &quot;Default Permissions Updated&quot;,
      description: &quot;Role default permissions have been updated successfully&quot;,
    });
  };

  const getRoleLevelColor = (level: number) => {
    if (level >= 90)
      return &quot;bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200&quot;;
    if (level >= 70)
      return &quot;bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200&quot;;
    if (level >= 50)
      return &quot;bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200&quot;;
    return &quot;bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200&quot;;
  };

  const getRoleLevelText = (level: number) => {
    if (level >= 90) return &quot;Critical&quot;;
    if (level >= 70) return &quot;High&quot;;
    if (level >= 50) return &quot;Moderate&quot;;
    return &quot;Standard&quot;;
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
      &quot;data:application/json;charset=utf-8,&quot; + encodeURIComponent(dataStr);
    const exportFileDefaultName = &quot;roles-export.json&quot;;

    const linkElement = document.createElement(&quot;a&quot;);
    linkElement.setAttribute(&quot;href&quot;, dataUri);
    linkElement.setAttribute(&quot;download&quot;, exportFileDefaultName);
    linkElement.click();

    toast({
      title: &quot;Export Complete&quot;,
      description: &quot;Roles data has been exported successfully&quot;,
    });
  };

  return (
    <div className=&quot;space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex flex-col gap-4 md:flex-row md:items-center md:justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>Role Management</h1>
          <p className=&quot;text-muted-foreground mt-2&quot;>
            Manage system roles and their permissions across the platform
          </p>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button variant=&quot;outline&quot; onClick={exportRoles}>
            <Download className=&quot;w-4 h-4 mr-2&quot; />
            Export
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className=&quot;w-4 h-4 mr-2&quot; />
                Create Role
              </Button>
            </DialogTrigger>
            <CreateRoleDialog />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className=&quot;pt-6&quot;>
          <div className=&quot;flex flex-col gap-4 md:flex-row md:items-center&quot;>
            <div className=&quot;flex-1&quot;>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4&quot; />
                <Input
                  placeholder=&quot;Search roles...&quot;
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=&quot;pl-10&quot;
                />
              </div>
            </div>
            <div className=&quot;flex gap-2&quot;>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className=&quot;w-[140px]&quot;>
                  <SelectValue placeholder=&quot;Access Level&quot; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;all&quot;>All Levels</SelectItem>
                  <SelectItem value=&quot;critical&quot;>Critical (90+)</SelectItem>
                  <SelectItem value=&quot;high&quot;>High (70-89)</SelectItem>
                  <SelectItem value=&quot;moderate&quot;>Moderate (50-69)</SelectItem>
                  <SelectItem value=&quot;standard&quot;>Standard (&lt;50)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className=&quot;w-[120px]&quot;>
                  <SelectValue placeholder=&quot;Type&quot; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;all&quot;>All Types</SelectItem>
                  <SelectItem value=&quot;system&quot;>System</SelectItem>
                  <SelectItem value=&quot;custom&quot;>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className=&quot;flex items-center justify-between&quot;>
        <p className=&quot;text-sm text-muted-foreground&quot;>
          Showing {filteredRoles.length} of {roles.length} roles
        </p>
      </div>

      {/* Roles Grid */}
      <div className=&quot;grid gap-6&quot;>
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
          <CardContent className=&quot;py-12 text-center&quot;>
            <Shield className=&quot;w-12 h-12 text-muted-foreground mx-auto mb-4&quot; />
            <h3 className=&quot;text-lg font-medium mb-2&quot;>No roles found</h3>
            <p className=&quot;text-muted-foreground mb-4&quot;>
              No roles match your current search and filter criteria.
            </p>
            <Button
              variant=&quot;outline&quot;
              onClick={() => {
                setSearchTerm(&quot;&quot;);
                setLevelFilter(&quot;all&quot;);
                setTypeFilter(&quot;all&quot;);
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
      <DialogContent className=&quot;max-w-2xl max-h-[80vh] overflow-y-auto&quot;>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new role with specific permissions and access levels
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue=&quot;basic&quot; className=&quot;w-full&quot;>
          <TabsList className=&quot;grid w-full grid-cols-2&quot;>
            <TabsTrigger value=&quot;basic&quot;>Basic Details</TabsTrigger>
            <TabsTrigger value=&quot;permissions&quot;>Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value=&quot;basic&quot; className=&quot;space-y-4&quot;>
            <div>
              <Label htmlFor=&quot;role-name&quot;>Role Name *</Label>
              <Input
                id=&quot;role-name&quot;
                placeholder=&quot;e.g., regional_manager&quot;
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />
              <p className=&quot;text-xs text-muted-foreground mt-1&quot;>
                Lowercase, underscores only. Used internally.
              </p>
            </div>
            <div>
              <Label htmlFor=&quot;display-name&quot;>Display Name *</Label>
              <Input
                id=&quot;display-name&quot;
                placeholder=&quot;e.g., Regional Manager&quot;
                value={createForm.displayName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor=&quot;description&quot;>Description</Label>
              <Textarea
                id=&quot;description&quot;
                placeholder=&quot;Describe the role's responsibilities...&quot;
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor=&quot;access-level&quot;>
                Access Level: {createForm.level}
              </Label>
              <Input
                id=&quot;access-level&quot;
                type=&quot;range&quot;
                min=&quot;1&quot;
                max=&quot;100&quot;
                value={createForm.level}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    level: parseInt(e.target.value),
                  })
                }
                className=&quot;mt-2&quot;
              />
              <div className=&quot;flex justify-between text-xs text-muted-foreground mt-1&quot;>
                <span>Standard (1)</span>
                <span>Critical (100)</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value=&quot;permissions&quot; className=&quot;space-y-4&quot;>
            <ScrollArea className=&quot;h-[300px]&quot;>
              {Object.entries(permissionCategories).map(
                ([category, permissions]) => (
                  <div key={category} className=&quot;mb-4&quot;>
                    <h4 className=&quot;font-medium mb-2&quot;>{category}</h4>
                    <div className=&quot;space-y-2 pl-4&quot;>
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className=&quot;flex items-start space-x-2&quot;
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
                          <div className=&quot;grid gap-1.5 leading-none&quot;>
                            <Label
                              htmlFor={permission.id}
                              className=&quot;text-sm font-medium&quot;
                            >
                              {permission.name.replace(/_/g, &quot; &quot;)}
                            </Label>
                            <p className=&quot;text-xs text-muted-foreground&quot;>
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
            variant=&quot;outline&quot;
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
      <DialogContent className=&quot;max-w-2xl max-h-[80vh] overflow-y-auto&quot;>
        <DialogHeader>
          <DialogTitle>Edit Role: {role.displayName}</DialogTitle>
          <DialogDescription>
            Update role details and permissions
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue=&quot;basic&quot; className=&quot;w-full&quot;>
          <TabsList className=&quot;grid w-full grid-cols-2&quot;>
            <TabsTrigger value=&quot;basic&quot;>Basic Details</TabsTrigger>
            <TabsTrigger value=&quot;permissions&quot;>Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value=&quot;basic&quot; className=&quot;space-y-4&quot;>
            <div>
              <Label htmlFor=&quot;edit-display-name&quot;>Display Name</Label>
              <Input
                id=&quot;edit-display-name&quot;
                value={createForm.displayName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, displayName: e.target.value })
                }
                disabled={role.isSystemRole}
              />
            </div>
            <div>
              <Label htmlFor=&quot;edit-description&quot;>Description</Label>
              <Textarea
                id=&quot;edit-description&quot;
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                disabled={role.isSystemRole}
              />
            </div>
            <div>
              <Label htmlFor=&quot;edit-access-level&quot;>
                Access Level: {createForm.level}
              </Label>
              <Input
                id=&quot;edit-access-level&quot;
                type=&quot;range&quot;
                min=&quot;1&quot;
                max=&quot;100&quot;
                value={createForm.level}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    level: parseInt(e.target.value),
                  })
                }
                disabled={role.isSystemRole}
                className=&quot;mt-2&quot;
              />
            </div>
          </TabsContent>
          <TabsContent value=&quot;permissions&quot; className=&quot;space-y-4&quot;>
            <ScrollArea className=&quot;h-[300px]&quot;>
              {Object.entries(permissionCategories).map(
                ([category, permissions]) => (
                  <div key={category} className=&quot;mb-4&quot;>
                    <h4 className=&quot;font-medium mb-2&quot;>{category}</h4>
                    <div className=&quot;space-y-2 pl-4&quot;>
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className=&quot;flex items-start space-x-2&quot;
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
                          <div className=&quot;grid gap-1.5 leading-none&quot;>
                            <Label
                              htmlFor={`edit-${permission.id}`}
                              className=&quot;text-sm font-medium&quot;
                            >
                              {permission.name.replace(/_/g, &quot; &quot;)}
                            </Label>
                            <p className=&quot;text-xs text-muted-foreground&quot;>
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
          <Button variant=&quot;outline&quot; onClick={() => setIsEditDialogOpen(false)}>
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
      <DialogContent className=&quot;max-w-md&quot;>
        <DialogHeader>
          <DialogTitle>{role.displayName} Permissions</DialogTitle>
          <DialogDescription>
            View all permissions assigned to this role
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className=&quot;h-[400px]&quot;>
          <div className=&quot;space-y-4&quot;>
            {Object.entries(permissionCategories).map(
              ([category, permissions]) => {
                const categoryPermissions = permissions.filter((p) =>
                  role.permissions.includes(p.id),
                );
                if (categoryPermissions.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className=&quot;font-medium mb-2&quot;>{category}</h4>
                    <div className=&quot;space-y-1 pl-4&quot;>
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className=&quot;text-sm&quot;>
                          <div className=&quot;font-medium&quot;>
                            {permission.name.replace(/_/g, &quot; &quot;)}
                          </div>
                          <div className=&quot;text-muted-foreground text-xs&quot;>
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
            variant=&quot;outline&quot;
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
      <DialogContent className=&quot;max-w-2xl&quot;>
        <DialogHeader>
          <DialogTitle>Users with {role.displayName} Role</DialogTitle>
          <DialogDescription>
            {role.userCount} users are assigned to this role
          </DialogDescription>
        </DialogHeader>
        <div className=&quot;space-y-4&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <Input placeholder=&quot;Search users...&quot; className=&quot;max-w-sm&quot; />
            <Button size=&quot;sm&quot;>
              <UserPlus className=&quot;w-4 h-4 mr-2&quot; />
              Assign Users
            </Button>
          </div>
          <ScrollArea className=&quot;h-[300px]&quot;>
            <div className=&quot;space-y-2&quot;>
              {mockUsers.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className=&quot;flex items-center justify-between p-2 border rounded&quot;
                >
                  <div>
                    <div className=&quot;font-medium&quot;>
                      {user.firstName} {user.lastName}
                    </div>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      {user.email}
                    </div>
                  </div>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant=&quot;outline&quot; onClick={() => setIsUsersDialogOpen(false)}>
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
    <Card className=&quot;hover:shadow-md transition-shadow&quot;>
      <CardHeader>
        <div className=&quot;flex items-center justify-between&quot;>
          <div className=&quot;flex items-center space-x-3&quot;>
            <Shield className=&quot;w-5 h-5 text-primary&quot; />
            <div>
              <CardTitle className=&quot;text-xl&quot;>{role.displayName}</CardTitle>
              <CardDescription className=&quot;text-sm font-mono text-muted-foreground&quot;>
                {role.name}
              </CardDescription>
            </div>
          </div>
          <div className=&quot;flex items-center space-x-2&quot;>
            <Badge variant={role.isSystemRole ? &quot;secondary&quot; : &quot;outline&quot;}>
              {role.isSystemRole ? &quot;System Role&quot; : &quot;Custom Role&quot;}
            </Badge>
            <Badge className={getRoleLevelColor(role.level)}>
              Level {role.level} - {getRoleLevelText(role.level)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className=&quot;space-y-4&quot;>
          <p className=&quot;text-sm text-muted-foreground&quot;>{role.description}</p>

          <Separator />

          <div className=&quot;flex items-center justify-between&quot;>
            <div className=&quot;flex items-center space-x-4&quot;>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Users className=&quot;w-4 h-4 text-muted-foreground&quot; />
                <button
                  onClick={onViewUsers}
                  className=&quot;text-sm font-medium hover:underline&quot;
                >
                  {role.userCount} users
                </button>
              </div>
              {role.createdAt && (
                <div className=&quot;text-xs text-muted-foreground&quot;>
                  Created {new Date(role.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className=&quot;flex items-center space-x-1&quot;>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={onViewPermissions}>
                <Eye className=&quot;w-4 h-4 mr-1&quot; />
                View
              </Button>
              <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={() => onEdit(role)}>
                <Edit2 className=&quot;w-4 h-4 mr-1&quot; />
                Edit
              </Button>
              <Button
                variant=&quot;outline&quot;
                size=&quot;sm&quot;
                onClick={() => onDuplicate(role)}
              >
                <Copy className=&quot;w-4 h-4 mr-1&quot; />
                Duplicate
              </Button>
              {!role.isSystemRole && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant=&quot;outline&quot;
                      size=&quot;sm&quot;
                      className=&quot;text-destructive hover:text-destructive&quot;
                    >
                      <Trash2 className=&quot;w-4 h-4&quot; />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the &quot;{role.displayName}&quot;
                        role? This action cannot be undone and will affect{&quot; &quot;}
                        {role.userCount} users.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(role.id)}
                        className=&quot;bg-destructive text-destructive-foreground hover:bg-destructive/90&quot;
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
            <Label className=&quot;text-xs font-medium text-muted-foreground&quot;>
              PERMISSIONS
            </Label>
            <div className=&quot;flex flex-wrap gap-1 mt-1&quot;>
              {role.permissions.slice(0, 4).map((permission) => (
                <Badge key={permission} variant=&quot;outline&quot; className=&quot;text-xs&quot;>
                  {permission.replace(/_/g, &quot; &quot;)}
                </Badge>
              ))}
              {role.permissions.length > 4 && (
                <Badge variant=&quot;outline&quot; className=&quot;text-xs">
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
