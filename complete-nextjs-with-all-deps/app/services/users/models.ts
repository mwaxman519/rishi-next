import { UserRole } from "../../../shared/schema";

// Domain models for the User service
export interface UserProfile {
  id: string;
  username: string;
  fullName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  role: UserRole;
  active: boolean;
  profileImage?: string | undefined;
  createdAt: Date;
}

// Used internally for authentication, extends UserProfile with password
export interface UserWithCredentials
  extends Omit<UserProfile, "fullName" | "email" | "phone" | "profileImage"> {
  password: string;
  fullName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  profileImage?: string | undefined;
}

// Request models
export interface CreateUserRequest {
  username: string;
  password: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: UserRole;
  profileImage?: string | null;
  active?: boolean;
  notes?: string | null;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  profileImage?: string;
  role?: UserRole;
  notes?: string;
}

// Response models
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type UserResponse = ServiceResponse<UserProfile>;
export type UsersResponse = ServiceResponse<UserProfile[]>;
