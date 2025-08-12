
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock kit data for now
    const kits = [
      {
        id: "1",
        name: "Basic Kit",
        description: "Standard field kit",
        status: "available",
        items: []
      }
    ];

    return NextResponse.json({ kits });
  } catch (error) {
    console.error("Error fetching kits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
