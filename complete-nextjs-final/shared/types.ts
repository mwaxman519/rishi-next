import { UserRole, Organization as DrizzleOrganization } from "./schema";

// Common JWT payload interface to be used by both client and server
export interface JwtPayload {
  id: string; // UUID string
  username: string;
  role: UserRole;
  fullName: string | undefined;
  organizationId: string | undefined; // Current active organization (UUID)
  // Additional fields that might be added
  regionIds: number[] | undefined; // User's assigned regions for RBAC purposes
}

// Extended Organization interface used in the API responses
// This includes additional fields not in the database schema
export interface Organization extends Omit<DrizzleOrganization, "id"> {
  id: string; // UUID string instead of serial number
  logo_url?: string | null; // URL to organization logo
  active: boolean; // Whether the organization is active
  user_role?: string; // Current user's role in this organization
  is_primary?: boolean; // Whether this is the user's primary organization
}
