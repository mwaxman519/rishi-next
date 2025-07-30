// Browser-compatible auth client utilities
// This file has no server-only utilities like scrypt to avoid client-side errors

import { UserRole } from "./schema";

// We only export the interface and not the implementation
export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName: string | undefined;
}

// No need to export anything else from this file - client-side components
// should not be handling password hashing or JWT operations directly
