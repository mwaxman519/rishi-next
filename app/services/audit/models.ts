/**
 * Audit Service Models
 *
 * These models represent the entities and data transfer objects
 * related to the audit logging service.
 */

import { z } from &quot;zod&quot;;

/**
 * Audit event types
 */
export enum AuditEventType {
  CREATE = &quot;create&quot;,
  READ = &quot;read&quot;,
  UPDATE = &quot;update&quot;,
  DELETE = &quot;delete&quot;,
  LOGIN = &quot;login&quot;,
  LOGOUT = &quot;logout&quot;,
  PERMISSION_CHANGE = &quot;permission_change&quot;,
  STATUS_CHANGE = &quot;status_change&quot;,
  ORG_CHANGE = &quot;organization_change&quot;,
  SYSTEM = &quot;system&quot;,
  OTHER = &quot;other&quot;,
}

/**
 * Audit event resource types
 */
export enum AuditResourceType {
  USER = &quot;user&quot;,
  ORGANIZATION = &quot;organization&quot;,
  LOCATION = &quot;location&quot;,
  EVENT = &quot;event&quot;,
  STAFF = &quot;staff&quot;,
  SCHEDULE = &quot;schedule&quot;,
  ROLE = &quot;role&quot;,
  PERMISSION = &quot;permission&quot;,
  SETTING = &quot;setting&quot;,
  ITEM = &quot;item&quot;,
  KIT = &quot;kit&quot;,
  OTHER = &quot;other&quot;,
}

/**
 * Audit log entry model
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  username: string;
  organizationId: string | null;
  eventType: AuditEventType;
  resourceType: AuditResourceType;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: Date;
}

/**
 * Audit log entry creation DTO
 */
export const createAuditLogSchema = z.object({
  userId: z.string(),
  username: z.string(),
  organizationId: z.string().nullable(),
  eventType: z.nativeEnum(AuditEventType),
  resourceType: z.nativeEnum(AuditResourceType),
  resourceId: z.string().nullable(),
  details: z.record(z.any()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  success: z.boolean().default(true),
});

export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;

/**
 * Audit log query parameters
 */
export const auditLogQuerySchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  eventType: z.nativeEnum(AuditEventType).optional(),
  resourceType: z.nativeEnum(AuditResourceType).optional(),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  success: z.boolean().optional(),
  limit: z.number().int().positive().optional().default(100),
  offset: z.number().int().nonnegative().optional().default(0),
});

export type AuditLogQueryParams = z.infer<typeof auditLogQuerySchema>;
