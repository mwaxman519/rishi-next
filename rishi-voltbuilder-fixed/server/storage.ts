import { eq, and, not, inArray, or, asc, desc, sql, like } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import {
  users,
  roles,
  permissions,
  organizations,
  userOrganizations,
  organizationPermissions,
  organizationInvitations,
  organizationBranding,
  organizationSettings,
  userOrganizationPreferences,
  // Brand management schema imports
  brands,
  states,
  regions,
  organizationRegions,
  kitTemplates,
  kits,
  kitComponentInventory,
  locations,
  brandLocations,
  // Type imports
  User,
  InsertUser,
  Permission,
  InsertPermission,
  Organization,
  InsertOrganization,
  OrganizationPermission,
  InsertOrganizationPermission,
  UserOrganization,
  InsertUserOrganization,
  OrganizationInvitation,
  InsertOrganizationInvitation,
  UserOrganizationPreferences,
  InsertUserOrganizationPreferences,
  // Brand management type imports
  Brand,
  InsertBrand,
  State,
  InsertState,
  Region,
  InsertRegion,
  KitTemplate,
  InsertKitTemplate,
  Kit,
  InsertKit,
  KitComponentInventory,
  InsertKitComponentInventory,
  Location,
  InsertLocation,
  BrandLocation,
  InsertBrandLocation,
  rolePermissions,
} from "../shared/schema";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Parameters for organization-aware storage operations
export interface OrganizationContext {
  organizationId: string;
  userRole?: string; // Optional user role within organization
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(
    id: string,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  createOrganization(
    organizationData: InsertOrganization,
  ): Promise<Organization>;
  updateOrganization(
    id: string,
    organizationData: Partial<InsertOrganization>,
  ): Promise<Organization | undefined>;
  deleteOrganization(id: string): Promise<boolean>;

  // Role and permission operations  
  getAllRoles(): Promise<string[]>;
  getRole(id: string): Promise<string | undefined>;
  getRoleByName(name: string): Promise<string | undefined>;
  createRole(roleData: { name: string }): Promise<string>;
  updateRole(id: string, roleData: { name: string }): Promise<string | undefined>;
  deleteRole(id: string): Promise<boolean>;

  getAllPermissions(): Promise<Permission[]>;
  getPermission(id: string): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  createPermission(permissionData: Partial<Permission>): Promise<Permission>;
  updatePermission(
    id: string,
    permissionData: Partial<Permission>,
  ): Promise<Permission | undefined>;
  deletePermission(id: string): Promise<boolean>;

  getRolePermissions(roleId: string): Promise<Permission[]>;
  addPermissionToRole(roleId: string, permissionId: string): Promise<boolean>;
  removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<boolean>;

  // Organization-aware User operations
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  getUsersInOrganization(context: OrganizationContext): Promise<User[]>;
  getUserInOrganization(
    userId: string,
    context: OrganizationContext,
  ): Promise<User | undefined>;
  createUserInOrganization(
    userData: InsertUser,
    context: OrganizationContext,
  ): Promise<User>;
  updateUserInOrganization(
    userId: string,
    userData: Partial<InsertUser>,
    context: OrganizationContext,
  ): Promise<User | undefined>;

  // Organization-aware Role and Permission operations
  getRolesForOrganization(context: OrganizationContext): Promise<string[]>;
  getOrganizationPermissions(
    context: OrganizationContext,
  ): Promise<OrganizationPermission[]>;
  addOrganizationPermission(
    permissionData: InsertOrganizationPermission,
  ): Promise<OrganizationPermission>;
  updateOrganizationPermission(
    id: string,
    permissionData: Partial<InsertOrganizationPermission>,
  ): Promise<OrganizationPermission | undefined>;
  removeOrganizationPermission(id: string): Promise<boolean>;

  // Brand management operations
  getAllBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brandData: InsertBrand): Promise<Brand>;
  updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;

  // State operations
  getAllStates(): Promise<State[]>;
  getState(id: string): Promise<State | undefined>;
  createState(stateData: InsertState): Promise<State>;
  updateState(id: string, stateData: Partial<InsertState>): Promise<State | undefined>;
  deleteState(id: string): Promise<boolean>;

  // Region operations
  getAllRegions(): Promise<Region[]>;
  getRegion(id: string): Promise<Region | undefined>;
  getRegionsByState(stateId: string): Promise<Region[]>;
  createRegion(regionData: InsertRegion): Promise<Region>;
  updateRegion(id: string, regionData: Partial<InsertRegion>): Promise<Region | undefined>;
  deleteRegion(id: string): Promise<boolean>;

  // Kit template operations
  getAllKitTemplates(): Promise<KitTemplate[]>;
  getKitTemplate(id: string): Promise<KitTemplate | undefined>;
  createKitTemplate(kitTemplateData: InsertKitTemplate): Promise<KitTemplate>;
  updateKitTemplate(id: string, kitTemplateData: Partial<InsertKitTemplate>): Promise<KitTemplate | undefined>;
  deleteKitTemplate(id: string): Promise<boolean>;

  // Kit operations
  getAllKits(): Promise<Kit[]>;
  getKit(id: string): Promise<Kit | undefined>;
  getKitsByTemplate(templateId: string): Promise<Kit[]>;
  createKit(kitData: InsertKit): Promise<Kit>;
  updateKit(id: string, kitData: Partial<InsertKit>): Promise<Kit | undefined>;
  deleteKit(id: string): Promise<boolean>;

  // Kit component inventory operations
  getKitComponentInventory(kitId: string): Promise<KitComponentInventory[]>;
  updateKitComponentInventory(
    id: string,
    inventoryData: Partial<InsertKitComponentInventory>,
  ): Promise<KitComponentInventory | undefined>;

  // Location operations
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  getLocationsByState(stateId: string): Promise<Location[]>;
  createLocation(locationData: InsertLocation): Promise<Location>;
  updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;

  // Brand location operations
  getBrandLocations(brandId: string): Promise<BrandLocation[]>;
  createBrandLocation(brandLocationData: InsertBrandLocation): Promise<BrandLocation>;
  deleteBrandLocation(id: string): Promise<boolean>;

  // Initialization - sets up default data
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async updateUser(
    id: string,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Organization operations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }

  async getOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  async createOrganization(
    organizationData: InsertOrganization,
  ): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(organizationData).returning();
    if (!organization) throw new Error('Failed to create organization');
    return organization;
  }

  async updateOrganization(
    id: string,
    organizationData: Partial<InsertOrganization>,
  ): Promise<Organization | undefined> {
    const [organization] = await db
      .update(organizations)
      .set({ ...organizationData, updated_at: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const result = await db.delete(organizations).where(eq(organizations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Role and permission operations
  async getAllRoles(): Promise<string[]> {
    return Object.keys(rolePermissions);
  }

  async getRole(id: string): Promise<string | undefined> {
    const roles = Object.keys(rolePermissions);
    return roles.find(role => role === id);
  }

  async getRoleByName(name: string): Promise<string | undefined> {
    const roles = Object.keys(rolePermissions);
    return roles.find(role => role === name);
  }

  async createRole(roleData: { name: string }): Promise<string> {
    return roleData.name;
  }

  async updateRole(id: string, roleData: { name: string }): Promise<string | undefined> {
    return roleData.name;
  }

  async deleteRole(id: string): Promise<boolean> {
    return true;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, parseInt(id)));
    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
    return permission;
  }

  async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
    const [permission] = await db.insert(permissions).values({
      name: permissionData.name || '',
      description: permissionData.description || '',
    }).returning();
    if (!permission) throw new Error('Failed to create permission');
    return permission;
  }

  async updatePermission(
    id: string,
    permissionData: Partial<Permission>,
  ): Promise<Permission | undefined> {
    const [permission] = await db
      .update(permissions)
      .set({ ...permissionData, updated_at: new Date() })
      .where(eq(permissions.id, parseInt(id)))
      .returning();
    return permission;
  }

  async deletePermission(id: string): Promise<boolean> {
    const result = await db.delete(permissions).where(eq(permissions.id, parseInt(id)));
    return (result.rowCount ?? 0) > 0;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePerms = rolePermissions[roleId as keyof typeof rolePermissions];
    if (!rolePerms) return [];
    
    const permsArray = [...rolePerms]; // Convert readonly array to mutable array
    const perms = await db.select().from(permissions).where(inArray(permissions.name, permsArray));
    return perms;
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<boolean> {
    return true;
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<boolean> {
    return true;
  }

  // Organization-aware User operations
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    const usersInOrg = await db
      .select({ user: users })
      .from(users)
      .innerJoin(userOrganizations, eq(userOrganizations.user_id, users.id))
      .where(eq(userOrganizations.organization_id, organizationId));
    
    return usersInOrg.map(row => row.user);
  }

  async getUsersInOrganization(context: OrganizationContext): Promise<User[]> {
    return this.getUsersByOrganization(context.organizationId);
  }

  async getUserInOrganization(
    userId: string,
    context: OrganizationContext,
  ): Promise<User | undefined> {
    const [userInOrg] = await db
      .select({ user: users })
      .from(users)
      .innerJoin(userOrganizations, eq(userOrganizations.user_id, users.id))
      .where(
        and(
          eq(users.id, userId),
          eq(userOrganizations.organization_id, context.organizationId)
        )
      );
    
    return userInOrg?.user;
  }

  async createUserInOrganization(
    userData: InsertUser,
    context: OrganizationContext,
  ): Promise<User> {
    const user = await this.createUser(userData);
    
    // Add user to organization
    await db.insert(userOrganizations).values({
      user_id: user.id,
      organization_id: context.organizationId,
      role: context.userRole || 'client_user',
    });
    
    return user;
  }

  async updateUserInOrganization(
    userId: string,
    userData: Partial<InsertUser>,
    context: OrganizationContext,
  ): Promise<User | undefined> {
    const user = await this.getUserInOrganization(userId, context);
    if (!user) return undefined;
    
    return this.updateUser(userId, userData);
  }

  // Organization-aware Role and Permission operations
  async getRolesForOrganization(context: OrganizationContext): Promise<string[]> {
    return Object.keys(rolePermissions);
  }

  async getOrganizationPermissions(
    context: OrganizationContext,
  ): Promise<OrganizationPermission[]> {
    return await db.select().from(organizationPermissions);
  }

  async addOrganizationPermission(
    permissionData: InsertOrganizationPermission,
  ): Promise<OrganizationPermission> {
    const [permission] = await db.insert(organizationPermissions).values(permissionData).returning();
    if (!permission) throw new Error('Failed to create organization permission');
    return permission;
  }

  async updateOrganizationPermission(
    id: string,
    permissionData: Partial<InsertOrganizationPermission>,
  ): Promise<OrganizationPermission | undefined> {
    const [permission] = await db
      .update(organizationPermissions)
      .set(permissionData)
      .where(eq(organizationPermissions.id, id))
      .returning();
    return permission;
  }

  async removeOrganizationPermission(id: string): Promise<boolean> {
    const result = await db.delete(organizationPermissions).where(eq(organizationPermissions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Brand management operations
  async getAllBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(brandData).returning();
    if (!brand) throw new Error('Failed to create brand');
    return brand;
  }

  async updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [brand] = await db
      .update(brands)
      .set({ ...brandData, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  async deleteBrand(id: string): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // State operations
  async getAllStates(): Promise<State[]> {
    return await db.select().from(states);
  }

  async getState(id: string): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }

  async createState(stateData: InsertState): Promise<State> {
    const [state] = await db.insert(states).values(stateData).returning();
    if (!state) throw new Error('Failed to create state');
    return state;
  }

  async updateState(id: string, stateData: Partial<InsertState>): Promise<State | undefined> {
    const [state] = await db
      .update(states)
      .set({ ...stateData, updated_at: new Date() })
      .where(eq(states.id, id))
      .returning();
    return state;
  }

  async deleteState(id: string): Promise<boolean> {
    const result = await db.delete(states).where(eq(states.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Region operations
  async getAllRegions(): Promise<Region[]> {
    return await db.select().from(regions);
  }

  async getRegion(id: string): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.id, id));
    return region;
  }

  async getRegionsByState(stateId: string): Promise<Region[]> {
    return await db.select().from(regions).where(eq(regions.state, stateId));
  }

  async createRegion(regionData: InsertRegion): Promise<Region> {
    const [region] = await db.insert(regions).values(regionData).returning();
    if (!region) throw new Error('Failed to create region');
    return region;
  }

  async updateRegion(id: string, regionData: Partial<InsertRegion>): Promise<Region | undefined> {
    const [region] = await db
      .update(regions)
      .set({ ...regionData, updated_at: new Date() })
      .where(eq(regions.id, id))
      .returning();
    return region;
  }

  async deleteRegion(id: string): Promise<boolean> {
    const result = await db.delete(regions).where(eq(regions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Kit template operations
  async getAllKitTemplates(): Promise<KitTemplate[]> {
    return await db.select().from(kitTemplates);
  }

  async getKitTemplate(id: string): Promise<KitTemplate | undefined> {
    const [kitTemplate] = await db.select().from(kitTemplates).where(eq(kitTemplates.id, id));
    return kitTemplate;
  }

  async createKitTemplate(kitTemplateData: InsertKitTemplate): Promise<KitTemplate> {
    const [kitTemplate] = await db.insert(kitTemplates).values(kitTemplateData).returning();
    if (!kitTemplate) throw new Error('Failed to create kit template');
    return kitTemplate;
  }

  async updateKitTemplate(id: string, kitTemplateData: Partial<InsertKitTemplate>): Promise<KitTemplate | undefined> {
    const [kitTemplate] = await db
      .update(kitTemplates)
      .set({ ...kitTemplateData, updated_at: new Date() })
      .where(eq(kitTemplates.id, id))
      .returning();
    return kitTemplate;
  }

  async deleteKitTemplate(id: string): Promise<boolean> {
    const result = await db.delete(kitTemplates).where(eq(kitTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Kit operations
  async getAllKits(): Promise<Kit[]> {
    return await db.select().from(kits);
  }

  async getKit(id: string): Promise<Kit | undefined> {
    const [kit] = await db.select().from(kits).where(eq(kits.id, id));
    return kit;
  }

  async getKitsByTemplate(templateId: string): Promise<Kit[]> {
    return await db.select().from(kits).where(eq(kits.template_id, templateId));
  }

  async createKit(kitData: InsertKit): Promise<Kit> {
    const [kit] = await db.insert(kits).values(kitData).returning();
    if (!kit) throw new Error('Failed to create kit');
    return kit;
  }

  async updateKit(id: string, kitData: Partial<InsertKit>): Promise<Kit | undefined> {
    const [kit] = await db
      .update(kits)
      .set({ ...kitData, updated_at: new Date() })
      .where(eq(kits.id, id))
      .returning();
    return kit;
  }

  async deleteKit(id: string): Promise<boolean> {
    const result = await db.delete(kits).where(eq(kits.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Kit component inventory operations
  async getKitComponentInventory(kitId: string): Promise<KitComponentInventory[]> {
    return await db.select().from(kitComponentInventory).where(eq(kitComponentInventory.kitId, kitId));
  }

  async updateKitComponentInventory(
    id: string,
    inventoryData: Partial<InsertKitComponentInventory>,
  ): Promise<KitComponentInventory | undefined> {
    const [inventory] = await db
      .update(kitComponentInventory)
      .set({ ...inventoryData, updatedAt: new Date() })
      .where(eq(kitComponentInventory.id, id))
      .returning();
    return inventory;
  }

  // Location operations
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async getLocationsByState(stateId: string): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.state, stateId));
  }

  async createLocation(locationData: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(locationData).returning();
    if (!location) throw new Error('Failed to create location');
    return location;
  }

  async updateLocation(id: string, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({ ...locationData, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Brand location operations
  async getBrandLocations(brandId: string): Promise<BrandLocation[]> {
    return await db.select().from(brandLocations).where(eq(brandLocations.brandId, brandId));
  }

  async createBrandLocation(brandLocationData: InsertBrandLocation): Promise<BrandLocation> {
    const [brandLocation] = await db.insert(brandLocations).values(brandLocationData).returning();
    if (!brandLocation) throw new Error('Failed to create brand location');
    return brandLocation;
  }

  async deleteBrandLocation(id: string): Promise<boolean> {
    const result = await db.delete(brandLocations).where(eq(brandLocations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Initialization
  async initializeDefaultData(): Promise<void> {
    // This method can be used to set up default data if needed
    // For now, we'll leave it empty as the database should already have the required data
  }
}

export const storage = new DatabaseStorage();

// Configure session store for production
export const sessionStore = new PostgresSessionStore({
  pool: pool,
  tableName: 'session',
  createTableIfMissing: true,
});