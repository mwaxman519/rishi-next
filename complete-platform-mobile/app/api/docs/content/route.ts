import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Fast response for autoscale deployment
  return NextResponse.json({ 
    content: "Documentation will be available after deployment completes",
    metadata: { 
      title: "Loading Documentation...", 
      description: "Please wait while the system initializes", 
      tags: [], 
      lastUpdated: new Date() 
    }
  });
}
