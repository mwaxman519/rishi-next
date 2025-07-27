import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import { 
  users, 
  performanceSummary,
  managerReviews, 
  onTimePerformance, 
  locationCompliance, 
  dispensaryRatings, 
  staffRatings, 
  activityCompletionRates, 
  dataFormCompletion, 
  dataFormQualityRatings
} from '@/shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, brandAgentId, period, periodValue } = await request.json();

    if (!organizationId || !brandAgentId || !period || !periodValue) {
      return NextResponse.json({ 
        error: 'Organization ID, Brand Agent ID, period, and period value are required' 
      }, { status: 400 });
    }

    // Calculate aggregated metrics for the brand agent
    const calculations = await Promise.all([
      // 1. Average Manager Review
      db.select({ 
        avg: sql<number>`AVG(${managerReviews.rating})::numeric(3,2)` 
      })
      .from(managerReviews)
      .where(
        and(
          eq(managerReviews.brandAgentId, brandAgentId),
          eq(managerReviews.organizationId, organizationId),
          sql`${managerReviews.reviewPeriod} = ${periodValue}`
        )
      ),

      // 2. On-time Performance Percentage
      db.select({ 
        percentage: sql<number>`(COUNT(CASE WHEN ${onTimePerformance.isOnTime} = true THEN 1 END) * 100.0 / COUNT(*))::numeric(5,2)` 
      })
      .from(onTimePerformance)
      .where(
        and(
          eq(onTimePerformance.brandAgentId, brandAgentId),
          eq(onTimePerformance.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${onTimePerformance.createdAt}) = ${periodValue}-01` :
            sql`1=1` // Add quarterly/yearly logic as needed
        )
      ),

      // 3. Location Compliance Percentage
      db.select({ 
        percentage: sql<number>`(COUNT(CASE WHEN ${locationCompliance.isCompliant} = true THEN 1 END) * 100.0 / COUNT(*))::numeric(5,2)` 
      })
      .from(locationCompliance)
      .where(
        and(
          eq(locationCompliance.brandAgentId, brandAgentId),
          eq(locationCompliance.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${locationCompliance.createdAt}) = ${periodValue}-01` :
            sql`1=1`
        )
      ),

      // 4. Average Dispensary Rating
      db.select({ 
        avg: sql<number>`AVG(${dispensaryRatings.rating})::numeric(3,2)` 
      })
      .from(dispensaryRatings)
      .where(
        and(
          eq(dispensaryRatings.brandAgentId, brandAgentId),
          eq(dispensaryRatings.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${dispensaryRatings.ratingDate}) = ${periodValue}-01` :
            sql`1=1`
        )
      ),

      // 5. Average Staff Rating
      db.select({ 
        avg: sql<number>`AVG(${staffRatings.rating})::numeric(3,2)` 
      })
      .from(staffRatings)
      .where(
        and(
          eq(staffRatings.brandAgentId, brandAgentId),
          eq(staffRatings.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${staffRatings.ratingDate}) = ${periodValue}-01` :
            sql`1=1`
        )
      ),

      // 6. Activity Completion Percentage
      db.select({ 
        percentage: sql<number>`(COUNT(CASE WHEN ${activityCompletionRates.isCompleted} = true THEN 1 END) * 100.0 / COUNT(*))::numeric(5,2)` 
      })
      .from(activityCompletionRates)
      .where(
        and(
          eq(activityCompletionRates.brandAgentId, brandAgentId),
          eq(activityCompletionRates.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${activityCompletionRates.createdAt}) = ${periodValue}-01` :
            sql`1=1`
        )
      ),

      // 7. Data Form Completion Percentage
      db.select({ 
        percentage: sql<number>`(COUNT(CASE WHEN ${dataFormCompletion.isCompleted} = true THEN 1 END) * 100.0 / COUNT(*))::numeric(5,2)` 
      })
      .from(dataFormCompletion)
      .where(
        and(
          eq(dataFormCompletion.brandAgentId, brandAgentId),
          eq(dataFormCompletion.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${dataFormCompletion.createdAt}) = ${periodValue}-01` :
            sql`1=1`
        )
      ),

      // 8. Average Data Form Quality Rating
      db.select({ 
        avg: sql<number>`AVG(${dataFormQualityRatings.qualityRating})::numeric(3,2)` 
      })
      .from(dataFormQualityRatings)
      .where(
        and(
          eq(dataFormQualityRatings.brandAgentId, brandAgentId),
          eq(dataFormQualityRatings.organizationId, organizationId),
          period === 'monthly' ? 
            sql`DATE_TRUNC('month', ${dataFormQualityRatings.reviewDate}) = ${periodValue}-01` :
            sql`1=1`
        )
      ),
    ]);

    // Extract calculated values
    const [
      avgManagerReview,
      onTimePercentage,
      locationCompliancePercentage,
      avgDispensaryRating,
      avgStaffRating,
      activityCompletionPercentage,
      dataFormCompletionPercentage,
      avgDataFormQualityRating,
    ] = calculations.map(result => result[0]);

    // Calculate overall performance score (weighted average)
    const metrics = [
      avgManagerReview.avg || 0,
      (onTimePercentage.percentage || 0) / 20, // Convert percentage to 5-point scale
      (locationCompliancePercentage.percentage || 0) / 20,
      avgDispensaryRating.avg || 0,
      avgStaffRating.avg || 0,
      (activityCompletionPercentage.percentage || 0) / 20,
      (dataFormCompletionPercentage.percentage || 0) / 20,
      avgDataFormQualityRating.avg || 0,
    ];

    const overallScore = metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length;

    // Insert or update performance summary
    const performanceData = {
      brandAgentId,
      organizationId,
      periodType: period,
      periodValue,
      avgManagerReview: avgManagerReview.avg,
      onTimePercentage: onTimePercentage.percentage,
      locationCompliancePercentage: locationCompliancePercentage.percentage,
      avgDispensaryRating: avgDispensaryRating.avg,
      avgStaffRating: avgStaffRating.avg,
      activityCompletionPercentage: activityCompletionPercentage.percentage,
      dataFormCompletionPercentage: dataFormCompletionPercentage.percentage,
      avgDataFormQualityRating: avgDataFormQualityRating.avg,
      overallPerformanceScore: overallScore,
      calculatedAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if record exists
    const existingRecord = await db
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

    if (existingRecord.length > 0) {
      // Update existing record
      await db
        .update(performanceSummary)
        .set(performanceData)
        .where(eq(performanceSummary.id, existingRecord[0].id));
    } else {
      // Insert new record
      await db
        .insert(performanceSummary)
        .values({
          ...performanceData,
          createdAt: new Date(),
        });
    }

    return NextResponse.json({
      success: true,
      performanceData,
      message: 'Performance metrics calculated and saved successfully',
    });
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate performance metrics' },
      { status: 500 }
    );
  }
}