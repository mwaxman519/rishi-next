/**
 * Analytics Event Publisher
 *
 * Publishes analytics-related events to the platform event bus
 * following the established event-driven architecture patterns.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 * @since Phase 7 Implementation
 */

import { EventBus } from &quot;../core/EventBus&quot;;

const eventBus = new EventBus();
import { Dashboard, GeneratedReport, UpdateDashboardInput } from &quot;./models&quot;;

class AnalyticsEventPublisher {
  /**
   * Dashboard Events
   */

  async publishDashboardCreated(
    dashboard: Dashboard,
    createdBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.dashboard.created&quot;, {
      dashboard,
      createdBy,
      organizationId,
      timestamp: new Date(),
    });
  }

  async publishDashboardUpdated(
    dashboard: Dashboard,
    updatedBy: string,
    changes: UpdateDashboardInput,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.dashboard.updated&quot;, {
      dashboard,
      updatedBy,
      changes,
      organizationId,
      timestamp: new Date(),
    });
  }

  async publishDashboardDeleted(
    dashboardId: string,
    deletedBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.dashboard.deleted&quot;, {
      dashboardId,
      deletedBy,
      organizationId,
      timestamp: new Date(),
    });
  }

  async publishDashboardViewed(
    dashboardId: string,
    viewedBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.dashboard.viewed&quot;, {
      dashboardId,
      viewedBy,
      organizationId,
      timestamp: new Date(),
    });
  }

  /**
   * Report Events
   */

  async publishReportGenerated(
    report: GeneratedReport,
    generatedBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.report.generated&quot;, {
      report,
      generatedBy,
      organizationId,
      timestamp: new Date(),
    });
  }

  async publishReportDownloaded(
    reportId: string,
    downloadedBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.report.downloaded&quot;, {
      reportId,
      downloadedBy,
      organizationId,
      timestamp: new Date(),
    });
  }

  /**
   * Metrics Events
   */

  async publishMetricThresholdExceeded(
    metricId: string,
    currentValue: number,
    threshold: number,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.metric.threshold_exceeded&quot;, {
      metricId,
      currentValue,
      threshold,
      organizationId,
      timestamp: new Date(),
    });
  }

  async publishDataExported(
    format: string,
    recordCount: number,
    exportedBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish(&quot;analytics.data.exported&quot;, {
      format,
      recordCount,
      exportedBy,
      organizationId,
      timestamp: new Date(),
    });
  }
}

export const analyticsEventPublisher = new AnalyticsEventPublisher();
