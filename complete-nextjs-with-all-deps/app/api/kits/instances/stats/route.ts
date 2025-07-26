import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

import { db } from '@/lib/db';
import { kitInstances, locations } from '@/shared/schema';
import { eq, and, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log("[Kit Instance Stats API] Starting stats request");

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    let whereConditions = [];
    
    // Filter by organization if provided
    if (organizationId) {
      whereConditions.push(eq(kitInstances.organization_id, organizationId));
    }

    // Get stats by status with table existence check
    let statusStats = [];
    let territoryStats = [];
    
    try {
      statusStats = await db
        .select({
          status: kitInstances.status,
          count: count(),
        })
        .from(kitInstances)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .groupBy(kitInstances.status);

      // Get unique territories count
      territoryStats = await db
        .select({
          territory: locations.city,
          count: count(),
        })
        .from(kitInstances)
        .leftJoin(locations, eq(kitInstances.location_id, locations.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .groupBy(locations.city);
    } catch (dbError: any) {
      console.log("[Kit Instance Stats API] Database table not ready during build time, returning default stats");
      // During build time or if table doesn't exist, return default stats
      if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
        const defaultStats = {
          totalInstances: 0,
          activeInstances: 0,
          inTransit: 0,
          preparing: 0,
          issues: 0,
          territories: 0,
        };
        console.log("[Kit Instance Stats API] Returning default stats for build time");
        return NextResponse.json(defaultStats);
      }
      throw dbError; // Re-throw if it's a different error
    }

    // Calculate totals
    const stats = {
      totalInstances: statusStats.reduce((sum, stat) => sum + stat.count, 0),
      activeInstances: statusStats.find(s => s.status === 'active')?.count || 0,
      inTransit: statusStats.find(s => s.status === 'in_transit')?.count || 0,
      preparing: statusStats.find(s => s.status === 'preparing')?.count || 0,
      issues: statusStats.find(s => s.status === 'maintenance')?.count || 0,
      territories: territoryStats.filter(t => t.territory).length,
    };

    console.log("[Kit Instance Stats API] Stats calculated:", stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching kit instance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit instance stats' },
      { status: 500 }
    );
  }
}