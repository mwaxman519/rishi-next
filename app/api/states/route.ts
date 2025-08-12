import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { db } from "../../../lib/db-connection";
import { states } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// Get all states
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active states, ordered by name
    const statesList = await db
      .select()
      .from(states)
      .where(eq(states.active, true))
      .orderBy(states.name);

    return NextResponse.json({ states: statesList });
  } catch (error) {
    console.error(`Error fetching states:`, error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 },
    );
  }
}
