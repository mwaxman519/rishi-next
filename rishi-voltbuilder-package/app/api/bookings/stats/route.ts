import { NextRequest, NextResponse } from "next/server";
import { BOOKING_STATUS, bookings, locations, activityTypes } from "@shared/schema";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { count, eq, and, gte, lte, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build base query conditions
    const conditions = [];
    
    if (organizationId) {
      conditions.push(eq(bookings.organizationId, organizationId));
    }
    
    if (startDate) {
      conditions.push(gte(bookings.scheduledDate, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(bookings.scheduledDate, new Date(endDate)));
    }

    // Get total bookings count
    const totalResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    // Get bookings by status
    const statusResults = await db
      .select({
        status: bookings.status,
        count: count()
      })
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(bookings.status);

    const byStatus = {
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      canceled: 0,
      completed: 0,
    };

    statusResults.forEach(result => {
      if (result.status in byStatus) {
        byStatus[result.status] = result.count;
      }
    });

    // Get bookings by priority
    const priorityResults = await db
      .select({
        priority: bookings.priority,
        count: count()
      })
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(bookings.priority);

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    priorityResults.forEach(result => {
      if (result.priority in byPriority) {
        byPriority[result.priority] = result.count;
      }
    });

    // Get bookings by month for current year
    const monthlyResults = await db
      .select({
        month: sql<string>`TO_CHAR(${bookings.scheduledDate}, 'Mon')`,
        count: count()
      })
      .from(bookings)
      .where(
        and(
          gte(bookings.scheduledDate, new Date(new Date().getFullYear(), 0, 1)),
          lte(bookings.scheduledDate, new Date(new Date().getFullYear(), 11, 31)),
          ...(conditions.length > 0 ? conditions : [])
        )
      )
      .groupBy(sql`TO_CHAR(${bookings.scheduledDate}, 'Mon')`)
      .orderBy(sql`EXTRACT(MONTH FROM ${bookings.scheduledDate})`);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth = months.map(month => {
      const found = monthlyResults.find(r => r.month === month);
      return { month, count: found ? found.count : 0 };
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentConditions = [
      gte(bookings.createdAt, thirtyDaysAgo),
      ...(conditions.length > 0 ? conditions : [])
    ];

    const recentActivity = {
      newBookings: 0,
      approvedBookings: 0,
      rejectedBookings: 0,
      canceledBookings: 0,
      completedBookings: 0,
    };

    const recentResults = await db
      .select({
        status: bookings.status,
        count: count()
      })
      .from(bookings)
      .where(and(...recentConditions))
      .groupBy(bookings.status);

    recentResults.forEach(result => {
      switch (result.status) {
        case 'draft':
        case 'pending':
          recentActivity.newBookings += result.count;
          break;
        case 'approved':
          recentActivity.approvedBookings = result.count;
          break;
        case 'rejected':
          recentActivity.rejectedBookings = result.count;
          break;
        case 'canceled':
          recentActivity.canceledBookings = result.count;
          break;
        case 'completed':
          recentActivity.completedBookings = result.count;
          break;
      }
    });

    // Get top locations
    const topLocations = await db
      .select({
        id: locations.id,
        name: locations.name,
        count: count()
      })
      .from(bookings)
      .leftJoin(locations, eq(bookings.locationId, locations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(locations.id, locations.name)
      .orderBy(desc(count()))
      .limit(5);

    // Get top activity types
    const topActivityTypes = await db
      .select({
        id: activityTypes.id,
        name: activityTypes.name,
        count: count()
      })
      .from(bookings)
      .leftJoin(activityTypes, eq(bookings.activityTypeId, activityTypes.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(activityTypes.id, activityTypes.name)
      .orderBy(desc(count()))
      .limit(5);

    const stats = {
      total,
      byStatus,
      byPriority,
      byMonth,
      recentActivity,
      topLocations,
      topActivityTypes,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking stats' },
      { status: 500 }
    );
  }
}
