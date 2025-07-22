import { generateStaticParams } from "./generateStaticParams";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import { 
  users, 
  managerReviews, 
  onTimePerformance, 
  locationCompliance, 
  dispensaryRatings, 
  staffRatings, 
  activityCompletionRates, 
  dataFormCompletion, 
  dataFormQualityRatings,
  performanceSummary
} from '@/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const period = searchParams.get('period') || 'monthly';
    const periodValue = searchParams.get('periodValue') || new Date().toISOString().substring(0, 7);

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const brandAgentId = params.id;

    // Get brand agent basic info
    const brandAgent = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
      })
      .from(users)
      .where(and(eq(users.id, brandAgentId), eq(users.role, 'brand_agent')))
      .limit(1);

    if (!brandAgent.length) {
      return NextResponse.json({ error: 'Brand agent not found' }, { status: 404 });
    }

    // Get performance summary
    const performanceSummaryData = await db
      .select()
      .from(performanceSummary)
      .where(
        and(
          eq(performanceSummary.brandAgentId, brandAgentId),
          eq(performanceSummary.organizationId, organizationId),
          eq(performanceSummary.periodType, period),
          eq(performanceSummary.periodValue, periodValue)
        )
      )
      .limit(1);

    // Get detailed metrics
    const [
      managerReviewsData,
      onTimePerformanceData,
      locationComplianceData,
      dispensaryRatingsData,
      staffRatingsData,
      activityCompletionData,
      dataFormCompletionData,
      dataFormQualityData,
    ] = await Promise.all([
      // Manager Reviews
      db.select().from(managerReviews)
        .where(
          and(
            eq(managerReviews.brandAgentId, brandAgentId),
            eq(managerReviews.organizationId, organizationId)
          )
        )
        .orderBy(desc(managerReviews.reviewDate))
        .limit(10),

      // On-time Performance
      db.select().from(onTimePerformance)
        .where(
          and(
            eq(onTimePerformance.brandAgentId, brandAgentId),
            eq(onTimePerformance.organizationId, organizationId)
          )
        )
        .orderBy(desc(onTimePerformance.createdAt))
        .limit(20),

      // Location Compliance
      db.select().from(locationCompliance)
        .where(
          and(
            eq(locationCompliance.brandAgentId, brandAgentId),
            eq(locationCompliance.organizationId, organizationId)
          )
        )
        .orderBy(desc(locationCompliance.createdAt))
        .limit(20),

      // Dispensary Ratings
      db.select().from(dispensaryRatings)
        .where(
          and(
            eq(dispensaryRatings.brandAgentId, brandAgentId),
            eq(dispensaryRatings.organizationId, organizationId)
          )
        )
        .orderBy(desc(dispensaryRatings.ratingDate))
        .limit(20),

      // Staff Ratings
      db.select().from(staffRatings)
        .where(
          and(
            eq(staffRatings.brandAgentId, brandAgentId),
            eq(staffRatings.organizationId, organizationId)
          )
        )
        .orderBy(desc(staffRatings.ratingDate))
        .limit(20),

      // Activity Completion
      db.select().from(activityCompletionRates)
        .where(
          and(
            eq(activityCompletionRates.brandAgentId, brandAgentId),
            eq(activityCompletionRates.organizationId, organizationId)
          )
        )
        .orderBy(desc(activityCompletionRates.createdAt))
        .limit(20),

      // Data Form Completion
      db.select().from(dataFormCompletion)
        .where(
          and(
            eq(dataFormCompletion.brandAgentId, brandAgentId),
            eq(dataFormCompletion.organizationId, organizationId)
          )
        )
        .orderBy(desc(dataFormCompletion.createdAt))
        .limit(20),

      // Data Form Quality
      db.select().from(dataFormQualityRatings)
        .where(
          and(
            eq(dataFormQualityRatings.brandAgentId, brandAgentId),
            eq(dataFormQualityRatings.organizationId, organizationId)
          )
        )
        .orderBy(desc(dataFormQualityRatings.reviewDate))
        .limit(20),
    ]);

    return NextResponse.json({
      brandAgent: brandAgent[0],
      performanceSummary: performanceSummaryData[0] || null,
      detailedMetrics: {
        managerReviews: managerReviewsData,
        onTimePerformance: onTimePerformanceData,
        locationCompliance: locationComplianceData,
        dispensaryRatings: dispensaryRatingsData,
        staffRatings: staffRatingsData,
        activityCompletion: activityCompletionData,
        dataFormCompletion: dataFormCompletionData,
        dataFormQuality: dataFormQualityData,
      },
      period,
      periodValue,
    });
  } catch (error) {
    console.error('Error fetching brand agent performance details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand agent performance details' },
      { status: 500 }
    );
  }
}