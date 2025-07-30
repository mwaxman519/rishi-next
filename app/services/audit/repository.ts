/**
 * Audit Repository
 *
 * This module provides the data access layer for audit logs.
 */

import { sql } from &quot;@vercel/postgres&quot;;
import { db } from &quot;../../lib/db&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import {
  AuditLogEntry,
  AuditLogQueryParams,
  CreateAuditLogDto,
} from &quot;./models&quot;;

/**
 * Repository for audit log entries
 */
export class AuditRepository {
  /**
   * Create a new audit log entry
   */
  async createAuditLog(
    auditLogData: CreateAuditLogDto,
  ): Promise<AuditLogEntry> {
    const id = uuidv4();
    const timestamp = new Date();

    try {
      const result = await db.execute(
        sql`INSERT INTO audit_logs (
          id, timestamp, user_id, username, organization_id, event_type, 
          resource_type, resource_id, details, ip_address, user_agent, success, created_at
        ) VALUES (
          ${id}, ${timestamp}, ${auditLogData.userId}, ${auditLogData.username}, 
          ${auditLogData.organizationId}, ${auditLogData.eventType}, ${auditLogData.resourceType}, 
          ${auditLogData.resourceId}, ${JSON.stringify(auditLogData.details)}, 
          ${auditLogData.ipAddress}, ${auditLogData.userAgent}, ${auditLogData.success}, ${timestamp}
        ) RETURNING *`,
      );

      // Adapt the result to match our model
      const row = result.rows[0];
      return this.mapRowToAuditLogEntry(row);
    } catch (error) {
      console.error(&quot;Error creating audit log entry:&quot;, error);
      throw new Error(&quot;Failed to create audit log entry&quot;);
    }
  }

  /**
   * Get audit logs based on filter parameters
   */
  async getAuditLogs(
    params: AuditLogQueryParams,
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      // Start building the query with common parts
      let whereClause = "&quot;;
      const conditions: string[] = [];
      const queryParams: any[] = [];

      // Add conditions based on query parameters
      if (params.userId) {
        conditions.push(`user_id = $${queryParams.length + 1}`);
        queryParams.push(params.userId);
      }

      if (params.organizationId) {
        conditions.push(`organization_id = $${queryParams.length + 1}`);
        queryParams.push(params.organizationId);
      }

      if (params.eventType) {
        conditions.push(`event_type = $${queryParams.length + 1}`);
        queryParams.push(params.eventType);
      }

      if (params.resourceType) {
        conditions.push(`resource_type = $${queryParams.length + 1}`);
        queryParams.push(params.resourceType);
      }

      if (params.resourceId) {
        conditions.push(`resource_id = $${queryParams.length + 1}`);
        queryParams.push(params.resourceId);
      }

      if (params.startDate) {
        conditions.push(`timestamp >= $${queryParams.length + 1}`);
        queryParams.push(new Date(params.startDate));
      }

      if (params.endDate) {
        conditions.push(`timestamp <= $${queryParams.length + 1}`);
        queryParams.push(new Date(params.endDate));
      }

      if (params.success !== undefined) {
        conditions.push(`success = $${queryParams.length + 1}`);
        queryParams.push(params.success);
      }

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(&quot; AND &quot;)}`;
      }

      // Count total results for pagination
      const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`;
      const countResult = await db.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count, 10);

      // Query for actual results with pagination
      const offset = params.offset || 0;
      const limit = params.limit || 100;

      const query = `
        SELECT * FROM audit_logs 
        ${whereClause} 
        ORDER BY timestamp DESC 
        LIMIT $${queryParams.length + 1} 
        OFFSET $${queryParams.length + 2}
      `;

      queryParams.push(limit, offset);
      const result = await db.query(query, queryParams);

      // Map the rows to our model
      const logs = result.rows.map(this.mapRowToAuditLogEntry);

      return { logs, total };
    } catch (error) {
      console.error(&quot;Error querying audit logs:&quot;, error);
      throw new Error(&quot;Failed to retrieve audit logs&quot;);
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM audit_logs WHERE id = ${id}`,
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToAuditLogEntry(result.rows[0]);
    } catch (error) {
      console.error(&quot;Error retrieving audit log entry:&quot;, error);
      throw new Error(&quot;Failed to retrieve audit log entry&quot;);
    }
  }

  /**
   * Map database row to AuditLogEntry model
   */
  private mapRowToAuditLogEntry(row: any): AuditLogEntry {
    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.user_id,
      username: row.username,
      organizationId: row.organization_id,
      eventType: row.event_type,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details:
        typeof row.details === &quot;string" ? JSON.parse(row.details) : row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      success: row.success,
      created_at: new Date(row.created_at),
    };
  }
}
