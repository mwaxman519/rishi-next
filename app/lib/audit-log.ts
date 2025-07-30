/**
 * Audit Logging Utility
 *
 * This module provides functions for creating and retrieving audit logs,
 * which track important actions in the system for security and compliance.
 */

import { NextRequest } from &quot;next/server&quot;;
import { db } from &quot;./db&quot;;
import { auditLogs } from &quot;../../shared/schema&quot;;
import { InsertAuditLog } from &quot;../../shared/schema&quot;;
import { eq, gte, lte, desc } from &quot;drizzle-orm&quot;;

interface AuditLogParams {
  user_id?: string;
  organization_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, any>;
  request?: NextRequest;
}

/**
 * Create an audit log entry
 *
 * @param params - Parameters for the audit log
 * @returns The created audit log entry
 */
export async function auditLog(params: AuditLogParams) {
  const {
    user_id,
    organization_id,
    action,
    resource,
    resource_id,
    details = {},
    request,
  } = params;

  try {
    // Extract IP address and user agent if request is provided
    let ip_address = undefined;
    let user_agent = undefined;

    if (request) {
      ip_address =
        request.headers.get(&quot;x-forwarded-for&quot;) ||
        request.headers.get(&quot;x-real-ip&quot;) ||
        &quot;unknown&quot;;
      user_agent = request.headers.get(&quot;user-agent&quot;) || null;
    }

    // Create the audit log entry
    const logEntry = await db
      .insert(auditLogs)
      .values({
        user_id,
        organization_id,
        action,
        resource,
        resource_id,
        details,
        ip_address,
        user_agent,
      })
      .returning();

    return logEntry[0];
  } catch (error) {
    // Log the error but don&apos;t throw - audit logging should not break functionality
    console.error(&quot;Error creating audit log:&quot;, error);
    return null;
  }
}

/**
 * Retrieve audit logs, filtered by various parameters
 *
 * @param params - Filter parameters
 * @returns Array of matching audit logs
 */
export async function getAuditLogs({
  userId,
  organizationId,
  action,
  resource,
  resourceId,
  startDate,
  endDate,
  limit = 100,
  offset = 0,
}: {
  userId?: string;
  organizationId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(auditLogs);

    // Apply filters
    if (userId) {
      query = query.where(eq(auditLogs.user_id, userId));
    }

    if (organizationId) {
      query = query.where(eq(auditLogs.organization_id, organizationId));
    }

    if (action) {
      query = query.where(eq(auditLogs.action, action));
    }

    if (resource) {
      query = query.where(eq(auditLogs.resource, resource));
    }

    if (resourceId) {
      query = query.where(eq(auditLogs.resource_id, resourceId));
    }

    if (startDate) {
      query = query.where(gte(auditLogs.timestamp, startDate));
    }

    if (endDate) {
      query = query.where(lte(auditLogs.timestamp, endDate));
    }

    // Apply pagination and sort by most recent first
    query = query
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return await query;
  } catch (error) {
    console.error(&quot;Error retrieving audit logs:&quot;, error);
    return [];
  }
}
