import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/shared/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log('[ORGANIZATIONS] GET - Fetching organizations');
    
    const orgList = await db.select().from(organizations);
    console.log(`[ORGANIZATIONS] Found ${orgList.length} organizations`);
    
    return NextResponse.json(orgList);
    
  } catch (error) {
    console.error('[ORGANIZATIONS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[ORGANIZATIONS] POST - Creating organization');
    
    const body = await request.json();
    const { name, tier, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Organization name required' }, { status: 400 });
    }

    const [newOrg] = await db.insert(organizations).values({
      name,
      tier: tier || 'tier_1',
      status: status || 'active'
    }).returning();

    console.log('[ORGANIZATIONS] Created organization:', newOrg.name);
    return NextResponse.json(newOrg);
    
  } catch (error) {
    console.error('[ORGANIZATIONS] Create error:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
