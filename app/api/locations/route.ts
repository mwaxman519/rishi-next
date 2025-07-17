import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { db } from '@/lib/db';
import { locations } from '@/shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    let whereConditions = [];

    // Filter by organization if provided
    if (organizationId) {
      whereConditions.push(eq(locations.organization_id, organizationId));
    }

    const locationList = await db
      .select({
        id: locations.id,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        state: locations.state,
        zip: locations.zip,
        organizationId: locations.organization_id,
        created_at: locations.created_at,
        updated_at: locations.updated_at,
      })
      .from(locations)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return NextResponse.json(locationList);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}