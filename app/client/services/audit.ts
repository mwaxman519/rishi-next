/**
 * Audit Service Client Adapter
 *
 * Client-side adapter for interacting with the audit logging service.
 */

import { ApiError } from "@/lib/errors";
import {
  AuditEventType,
  AuditResourceType,
  AuditLogEntry,
  AuditLogQueryParams,
} from "@/services/audit/models";

/**
 * Audit service client adapter
 */
export class AuditServiceClient {
  /**
   * Get audit logs with pagination and filtering
   * @param params Query parameters
   * @returns Audit logs array and total count
   */
  async getAuditLogs(
    params: AuditLogQueryParams,
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();

      if (params.userId) queryParams.append("userId", params.userId);
      if (params.organizationId)
        queryParams.append("organizationId", params.organizationId);
      if (params.eventType) queryParams.append("eventType", params.eventType);
      if (params.resourceType)
        queryParams.append("resourceType", params.resourceType);
      if (params.resourceId)
        queryParams.append("resourceId", params.resourceId);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.success !== undefined)
        queryParams.append("success", params.success.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.offset) queryParams.append("offset", params.offset.toString());

      const queryString = queryParams.toString();
      const url = `/api/audit${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to fetch audit logs",
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to fetch audit logs", 500);
    }
  }

  /**
   * Get a specific audit log entry by ID
   * @param id Audit log entry ID
   * @returns Audit log entry
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry> {
    try {
      const response = await fetch(`/api/audit/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to fetch audit log with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.log;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch audit log with ID ${id}`, 500);
    }
  }

  /**
   * Get audit logs for a specific user
   * @param userId User ID
   * @param params Additional query parameters
   * @returns Audit logs array and total count
   */
  async getUserAuditLogs(
    userId: string,
    params: Omit<AuditLogQueryParams, "userId"> = {},
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return this.getAuditLogs({ ...params, userId });
  }

  /**
   * Get audit logs for a specific organization
   * @param organizationId Organization ID
   * @param params Additional query parameters
   * @returns Audit logs array and total count
   */
  async getOrganizationAuditLogs(
    organizationId: string,
    params: Omit<AuditLogQueryParams, "organizationId"> = {},
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return this.getAuditLogs({ ...params, organizationId });
  }

  /**
   * Get audit logs for a specific resource
   * @param resourceType Resource type
   * @param resourceId Resource ID
   * @param params Additional query parameters
   * @returns Audit logs array and total count
   */
  async getResourceAuditLogs(
    resourceType: AuditResourceType,
    resourceId: string,
    params: Omit<AuditLogQueryParams, "resourceType" | "resourceId"> = {},
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return this.getAuditLogs({ ...params, resourceType, resourceId });
  }

  /**
   * Get audit logs for a specific event type
   * @param eventType Event type
   * @param params Additional query parameters
   * @returns Audit logs array and total count
   */
  async getEventTypeAuditLogs(
    eventType: AuditEventType,
    params: Omit<AuditLogQueryParams, "eventType"> = {},
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return this.getAuditLogs({ ...params, eventType });
  }
}

// Create singleton instance
export const auditService = new AuditServiceClient();
