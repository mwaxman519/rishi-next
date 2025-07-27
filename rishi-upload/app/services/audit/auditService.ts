/**
 * Audit Service
 *
 * Service layer for audit logging functionality.
 */

import { NextRequest } from "next/server";
import { AuditRepository } from "./repository";
import {
  AuditEventType,
  AuditLogEntry,
  AuditLogQueryParams,
  AuditResourceType,
  CreateAuditLogDto,
} from "./models";
import { getCurrentUser } from "../../lib/auth";

/**
 * Service for audit logging operations
 */
export class AuditService {
  private repository: AuditRepository;

  constructor() {
    this.repository = new AuditRepository();
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(data: CreateAuditLogDto): Promise<AuditLogEntry> {
    return this.repository.createAuditLog(data);
  }

  /**
   * Create an audit log entry from a request object
   */
  async logFromRequest(
    req: NextRequest,
    eventType: AuditEventType,
    resourceType: AuditResourceType,
    resourceId: string | null,
    details: Record<string, any> = {},
    success: boolean = true,
  ): Promise<AuditLogEntry | null> {
    try {
      const user = await getCurrentUser();

      if (!user) {
        console.warn("Cannot create audit log: No authenticated user");
        return null;
      }

      // Extract organization from context header
      const organizationId = req.headers.get("x-organization-id") || null;

      // Extract IP and User-Agent
      const ipAddress =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const userAgent = req.headers.get("user-agent") || null;

      const auditData: CreateAuditLogDto = {
        userId: user.id,
        username: user.username || user.email || "unknown",
        organizationId,
        eventType,
        resourceType,
        resourceId,
        details,
        ipAddress,
        userAgent,
        success,
      };

      return this.repository.createAuditLog(auditData);
    } catch (error) {
      console.error("Error creating audit log from request:", error);
      return null;
    }
  }

  /**
   * Get audit logs based on query parameters
   */
  async getAuditLogs(
    params: AuditLogQueryParams,
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return this.repository.getAuditLogs(params);
  }

  /**
   * Get a specific audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    return this.repository.getAuditLogById(id);
  }
}

// Singleton instance for use throughout the application
export const auditService = new AuditService();
