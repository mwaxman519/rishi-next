/**
 * Audit Service
 *
 * Service layer for audit logging functionality.
 */

import { NextRequest } from &quot;next/server&quot;;
import { AuditRepository } from &quot;./repository&quot;;
import {
  AuditEventType,
  AuditLogEntry,
  AuditLogQueryParams,
  AuditResourceType,
  CreateAuditLogDto,
} from &quot;./models&quot;;
import { getCurrentUser } from &quot;../../lib/auth&quot;;

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
        console.warn(&quot;Cannot create audit log: No authenticated user&quot;);
        return null;
      }

      // Extract organization from context header
      const organizationId = req.headers.get(&quot;x-organization-id&quot;) || null;

      // Extract IP and User-Agent
      const ipAddress =
        req.headers.get(&quot;x-forwarded-for&quot;) ||
        req.headers.get(&quot;x-real-ip&quot;) ||
        &quot;unknown&quot;;

      const userAgent = req.headers.get(&quot;user-agent&quot;) || null;

      const auditData: CreateAuditLogDto = {
        userId: user.id,
        username: user.username || user.email || &quot;unknown&quot;,
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
      console.error(&quot;Error creating audit log from request:&quot;, error);
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
