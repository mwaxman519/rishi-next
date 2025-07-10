import { UserRole } from "../../../shared/schema";

// Domain models
export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}

// Request models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
}

// Response models
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}
