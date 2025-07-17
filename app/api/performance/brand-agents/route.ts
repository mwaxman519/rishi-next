import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import { users, performanceSummary } from '@/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        profileImageUrl: users.profileImageUrl,
        // Performance metrics
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
      .leftJoin(
        performanceSummary,
        and(
          eq(performanceSummary.brandAgentId, users.id),
          eq(performanceSummary.organizationId, organizationId),
          eq(performanceSummary.periodType, period),
          eq(performanceSummary.periodValue, periodValue)
        )
      )
      .where(eq(users.role, 'brand_agent'))
      .orderBy(desc(performanceSummary.overallPerformanceScore));

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