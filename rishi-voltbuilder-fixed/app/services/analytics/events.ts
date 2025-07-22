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

import { EventBus } from "../core/EventBus";

const eventBus = new EventBus();
import { Dashboard, GeneratedReport, UpdateDashboardInput } from "./models";

class AnalyticsEventPublisher {
  /**
   * Dashboard Events
   */

  async publishDashboardCreated(
    dashboard: Dashboard,
    createdBy: string,
    organizationId: string,
  ): Promise<void> {
    await eventBus.publish("analytics.dashboard.created", {
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
    await eventBus.publish("analytics.dashboard.updated", {
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
    await eventBus.publish("analytics.dashboard.deleted", {
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
    await eventBus.publish("analytics.dashboard.viewed", {
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
    await eventBus.publish("analytics.report.generated", {
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
    await eventBus.publish("analytics.report.downloaded", {
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
    await eventBus.publish("analytics.metric.threshold_exceeded", {
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
    await eventBus.publish("analytics.data.exported", {
      format,
      recordCount,
      exportedBy,
      organizationId,
      timestamp: new Date(),
    });
  }
}

export const analyticsEventPublisher = new AnalyticsEventPublisher();
