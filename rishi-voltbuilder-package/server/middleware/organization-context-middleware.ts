/**
 * Organization Context Middleware
 *
 * This middleware adds organization context to all API requests.
 * It extracts the organization ID from the request headers or session
 * and makes it available to downstream handlers.
 */

import { Request, Response, NextFunction } from "express";
import { IStorage, OrganizationContext } from "../storage";

// Default organization header name
const DEFAULT_ORG_HEADER = "x-organization-id";

// Organization middleware options
export interface OrganizationMiddlewareOptions {
  headerName?: string; // Custom header name for organization ID
  requireOrganization?: boolean; // Whether to require an organization ID
  defaultOrganizationId?: number; // Default organization ID if none is provided
}

// Default middleware options
const DEFAULT_OPTIONS: OrganizationMiddlewareOptions = {
  headerName: DEFAULT_ORG_HEADER,
  requireOrganization: true,
  defaultOrganizationId: undefined,
};

// Extend Request interface to include organization context
declare global {
  namespace Express {
    interface Request {
      organizationContext?: OrganizationContext;
    }
  }
}

/**
 * Create organization context middleware
 */
export function createOrganizationContextMiddleware(
  storage: IStorage,
  options: OrganizationMiddlewareOptions = {},
) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async function organizationContextMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // First try to get organization ID from header
      let organizationId: number | undefined;
      const headerValue = req.header(config.headerName || DEFAULT_ORG_HEADER);

      if (headerValue) {
        organizationId = parseInt(headerValue, 10);
        if (isNaN(organizationId)) {
          return res.status(400).json({
            error: "Invalid organization ID format in header",
          });
        }
      }

      // If not in header, try to get from user session
      if (!organizationId && req.user) {
        organizationId = (req.user as any).organizationId;
      }

      // If still not found, use default if available
      if (!organizationId && config.defaultOrganizationId) {
        organizationId = config.defaultOrganizationId;
      }

      // If organization ID is required but not found, return error
      if (config.requireOrganization && !organizationId) {
        return res.status(400).json({
          error: "Organization ID is required",
        });
      }

      // If we have an organization ID, verify it exists
      if (organizationId) {
        const organization = await storage.getOrganization(organizationId);

        if (!organization) {
          return res.status(404).json({
            error: "Organization not found",
          });
        }

        // Set organization context on request for downstream handlers
        req.organizationContext = {
          organizationId,
          // Add user role in organization if available
          userRole: req.user ? (req.user as any).role : undefined,
        };
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Helper function to get organization context from request
 */
export function getOrganizationContext(
  req: Request,
): OrganizationContext | undefined {
  return req.organizationContext;
}

/**
 * Helper function to require organization context from request
 * Throws an error if no context is available
 */
export function requireOrganizationContext(req: Request): OrganizationContext {
  const context = getOrganizationContext(req);

  if (!context) {
    throw new Error("Organization context is required but not available");
  }

  return context;
}
