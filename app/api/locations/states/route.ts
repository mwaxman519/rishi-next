import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";

/**
 * GET /api/locations/states
 * Retrieves a list of states with location counts
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // In a real implementation, this would query the database for states
    // Mock states for example purpose - replace with real data from database
    const states = [
      { id: "AL", code: "AL", name: "Alabama", count: 5 },
      { id: "AK", code: "AK", name: "Alaska", count: 2 },
      { id: "AZ", code: "AZ", name: "Arizona", count: 8 },
      { id: "AR", code: "AR", name: "Arkansas", count: 3 },
      { id: "CA", code: "CA", name: "California", count: 15 },
      { id: "CO", code: "CO", name: "Colorado", count: 7 },
      { id: "CT", code: "CT", name: "Connecticut", count: 4 },
      { id: "DE", code: "DE", name: "Delaware", count: 1 },
      { id: "FL", code: "FL", name: "Florida", count: 12 },
      { id: "GA", code: "GA", name: "Georgia", count: 9 },
      { id: "HI", code: "HI", name: "Hawaii", count: 2 },
      { id: "ID", code: "ID", name: "Idaho", count: 2 },
      { id: "IL", code: "IL", name: "Illinois", count: 8 },
      { id: "IN", code: "IN", name: "Indiana", count: 6 },
      { id: "IA", code: "IA", name: "Iowa", count: 3 },
    ];

    return NextResponse.json({ states });
  } catch (error) {
    console.error("Error retrieving states:", error);
    return NextResponse.json(
      { error: "Failed to retrieve states" },
      { status: 500 },
    );
  }
}
