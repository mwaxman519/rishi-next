import { db } from "../../lib/db";
import { users } from "../../../shared/schema";
import { eq } from "drizzle-orm";

/**
 * User repository functions for database operations
 */
export const userRepository = {
  /**
   * Get a user by ID
   */
  getUserById: async (id: string) => {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  /**
   * Get a user by username
   */
  getUserByUsername: async (username: string) => {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },

  /**
   * Find user by ID (alias for consistency)
   */
  findById: async (id: string) => {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  /**
   * Find user by username (alias for consistency)
   */
  findByUsername: async (username: string) => {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },

  /**
   * Get a user by username with password for authentication
   */
  findByUsernameWithPassword: async (username: string) => {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  },

  /**
   * Create a new user
   */
  create: async (userData: any) => {
    const result = await db
      .insert(users)
      .values({
        username: userData.username,
        password: userData.password,
        role: userData.role,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        active: true,
      })
      .returning();

    return result[0];
  },

  /**
   * Update a user
   */
  update: async (id: string, userData: any) => {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    return result[0];
  },

  /**
   * Delete a user
   */
  delete: async (id: string) => {
    await db.delete(users).where(eq(users.id, id));
    return true;
  },
};
