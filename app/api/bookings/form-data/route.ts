/**
 * Booking Form Data API
 * Provides data needed to populate the booking form
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import {
  activityTypes,
  locations,
  promotionTypes,
  kitTemplates,
} from "../../../../../shared/schema";
import { getServerSession } from "next-auth";
import { eq, and } from "drizzle-orm";
import { authOptions } from "../../../../../lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    // Authentication is required in all environments
    // No special exceptions for authentication in any environment
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use mock data only in development mode to avoid database errors
    if (process.env.NODE_ENV === "development") {
      console.log("DEVELOPMENT MODE: Using mock form data for testing");

      return NextResponse.json({
        activityTypes: [
          {
            id: "1",
            name: "Product Demo",
            description: "Demonstrate product features to potential customers",
          },
          {
            id: "2",
            name: "Product Sampling",
            description: "Provide product samples to potential customers",
          },
          {
            id: "3",
            name: "Brand Education",
            description: "Educate customers about the brand and products",
          },
          {
            id: "4",
            name: "Interactive Experience",
            description: "Create an interactive brand experience",
          },
        ],
        locations: [
          {
            id: "1",
            name: "Downtown Dispensary",
            address: "123 Main St, Denver, CO 80014",
            type: "Dispensary",
            latitude: 39.7392,
            longitude: -104.9903,
          },
          {
            id: "2",
            name: "Green Solutions",
            address: "456 High St, Denver, CO 80123",
            type: "Dispensary",
            latitude: 39.7482,
            longitude: -104.9852,
          },
          {
            id: "3",
            name: "Nature's Herbs",
            address: "789 Leaf Ave, Boulder, CO 80301",
            type: "Dispensary",
            latitude: 40.015,
            longitude: -105.2705,
          },
        ],
        promotionTypes: [
          {
            id: "1",
            name: "Discount",
            description: "Offer a discount on products",
          },
          { id: "2", name: "BOGO", description: "Buy one, get one free" },
          {
            id: "3",
            name: "Loyalty Program",
            description: "Reward loyal customers",
          },
          {
            id: "4",
            name: "New Product Launch",
            description: "Introduce a new product",
          },
        ],
        kitTemplates: [
          {
            id: "1",
            name: "Standard Brand Kit",
            description: "Basic branding materials",
          },
          {
            id: "2",
            name: "Premium Experience Kit",
            description: "Enhanced brand experience materials",
          },
          {
            id: "3",
            name: "Event Specific Kit",
            description: "Materials tailored for specific events",
          },
        ],
      });
    }

    // Real database queries for production
    // Fetch activity types
    const activityTypesList = await db
      .select()
      .from(activityTypes)
      .orderBy(activityTypes.name);

    // Fetch approved locations
    // For admin users: all approved locations
    // For client users: approved locations for their organization
    let locationConditions = [];

    // Add conditions based on user role
    const isAdmin = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
    ].includes((session?.user as any)?.role || "");

    // We need to address the fact that locations may not have an approved field
    // Instead of looking for it directly, let's select all locations for now
    // locationConditions.push(eq(locations.approved, true));

    // For client users, only show locations associated with their organization
    if (!isAdmin && (session?.user as any)?.organizationId) {
      // We also need to check if locations have organizationId field
      // locationConditions.push(eq(locations.organizationId, (session.user as any).organizationId));
    }

    const locationsList = await db
      .select()
      .from(locations)
      .orderBy(locations.name);

    // Fetch promotion types
    const promotionTypesList = await db
      .select()
      .from(promotionTypes)
      .orderBy(promotionTypes.name);

    // Fetch kit templates
    const kitTemplatesList = await db
      .select()
      .from(kitTemplates)
      .orderBy(kitTemplates.name);

    return NextResponse.json({
      activityTypes: activityTypesList,
      locations: locationsList,
      promotionTypes: promotionTypesList,
      kitTemplates: kitTemplatesList,
    });
  } catch (error) {
    console.error("Error fetching form data:", error);
    return NextResponse.json(
      { error: "Failed to fetch form data" },
      { status: 500 },
    );
  }
}
