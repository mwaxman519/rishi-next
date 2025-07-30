"use server";

import { db } from "../lib/db";
import { items } from "../../shared/schema";

/**
 * Get all items from the database
 * This is a server action that directly accesses the database
 */
export async function getItems() {
  // For server components, fetch data directly from the database
  try {
    const allItems = await db.select().from(items);
    return allItems;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}
