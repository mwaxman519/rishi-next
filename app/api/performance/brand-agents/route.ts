import { NextRequest, NextResponse } from 'next/server';

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from '@/lib/db';
import { users, performanceSummary, userOrganizations } from '../../../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    let currentUser: any;
    try {
      currentUser = verify(authToken, process.env.JWT_SECRET || 'default-secret');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const period = searchParams.get('period') || 'monthly';
    const periodValue = searchParams.get('periodValue') || new Date().toISOString().substring(0, 7); // Default to current month

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Get brand agents with their performance summaries
    const brandAgentsWithPerformance = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        profileImageUrl: users.profileImage,
        role: users.role,
        // Performance metrics (may be null if no performance data)
        avgManagerReview: performanceSummary.avgManagerReview,
        onTimePercentage: performanceSummary.onTimePercentage,
        locationCompliancePercentage: performanceSummary.locationCompliancePercentage,
        avgDispensaryRating: performanceSummary.avgDispensaryRating,
        avgStaffRating: performanceSummary.avgStaffRating,
        activityCompletionPercentage: performanceSummary.activityCompletionPercentage,
        dataFormCompletionPercentage: performanceSummary.dataFormCompletionPercentage,
        avgDataFormQualityRating: performanceSummary.avgDataFormQualityRating,
        overallPerformanceScore: performanceSummary.overallPerformanceScore,
        calculatedAt: performanceSummary.calculatedAt,
      })
      .from(users)
      .innerJoin(
        userOrganizations,
        eq(userOrganizations.user_id, users.id)
      )
      .leftJoin(
        performanceSummary,
        and(
          eq(performanceSummary.brandAgentId, users.id),
          eq(performanceSummary.organizationId, organizationId),
          eq(performanceSummary.periodType, period),
          eq(performanceSummary.periodValue, periodValue)
        )
      )
      .where(
        and(
          eq(users.role, 'brand_agent'),
          eq(userOrganizations.organization_id, organizationId)
        )
      );

    return NextResponse.json({
      brandAgents: brandAgentsWithPerformance,
      period,
      periodValue,
      organizationId,
    });
  } catch (error) {
    console.error('Error fetching brand agents performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand agents performance' },
      { status: 500 }
    );
  }
}