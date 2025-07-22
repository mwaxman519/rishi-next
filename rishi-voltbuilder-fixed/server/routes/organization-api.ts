/**
 * Organization API Routes
 *
 * These routes demonstrate the use of organization-aware repositories and middleware
 * to ensure proper data isolation between organizations.
 */

import express, { Request, Response } from "express";
import {
  UserRepository,
  PermissionRepository,
  RepositoryFactory,
} from "../repositories/organization-aware-repository";
import {
  createOrganizationContextMiddleware,
  requireOrganizationContext,
} from "../middleware/organization-context-middleware";
import { OrganizationCacheManager } from "../cache/organization-cache";
import { IStorage } from "../storage";

// Create a cache manager with default options
const cacheManager = new OrganizationCacheManager();

/**
 * Create organization API router
 */
export function createOrganizationApiRouter(storage: IStorage) {
  const router = express.Router();

  // Create repositories factory
  const repoFactory = new RepositoryFactory(storage);
  const userRepo = repoFactory.createUserRepository();
  const permissionRepo = repoFactory.createPermissionRepository();

  // Add organization context middleware to all routes
  router.use(
    createOrganizationContextMiddleware(storage, {
      requireOrganization: true,
    }),
  );

  // Get all users in the organization
  router.get("/users", async (req: Request, res: Response) => {
    try {
      const context = requireOrganizationContext(req);

      // Try to get from cache first
      const cacheKey = `org_${context.organizationId}_users`;
      const cachedUsers = cacheManager.get(cacheKey, context);

      if (cachedUsers) {
        return res.json(cachedUsers);
      }

      // Not in cache, fetch from repository
      const users = await userRepo.getUsers(context);

      // Cache the result
      cacheManager.set(cacheKey, users, context);

      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get a specific user in the organization
  router.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const context = requireOrganizationContext(req);
      const user = await userRepo.getUser(userId, context);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all available roles for the organization
  router.get("/roles", async (req: Request, res: Response) => {
    try {
      const context = requireOrganizationContext(req);

      // Try to get from cache first
      const cacheKey = `org_${context.organizationId}_roles`;
      const cachedRoles = cacheManager.get(cacheKey, context);

      if (cachedRoles) {
        return res.json(cachedRoles);
      }

      // Not in cache, fetch from repository
      const roles = await permissionRepo.getRoles(context);

      // Cache the result
      cacheManager.set(cacheKey, roles, context);

      return res.json(roles);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all organization-specific permissions
  router.get("/permissions", async (req: Request, res: Response) => {
    try {
      const context = requireOrganizationContext(req);
      const permissions =
        await permissionRepo.getOrganizationPermissions(context);
      return res.json(permissions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get cache statistics for debugging
  router.get("/cache-stats", (req: Request, res: Response) => {
    try {
      const stats = cacheManager.getStats();
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Clear cache for the current organization
  router.post("/clear-cache", (req: Request, res: Response) => {
    try {
      const context = requireOrganizationContext(req);
      cacheManager.clearOrganization(context.organizationId);
      return res.json({ success: true, message: "Cache cleared successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
