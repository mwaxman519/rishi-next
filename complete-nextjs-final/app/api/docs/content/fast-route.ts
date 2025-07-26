import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Fast response for autoscale deployment
  return NextResponse.json({ 
    content: "Documentation temporarily unavailable during deployment",
    metadata: { title: "Loading...", description: "", tags: [], lastUpdated: new Date() }
  });
}