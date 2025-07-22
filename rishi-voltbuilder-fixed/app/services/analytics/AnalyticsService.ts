/**
 * Analytics & BI Dashboard Service - Event-Driven Microservice
 *
 * Enterprise-grade analytics service providing comprehensive business intelligence,
 * real-time metrics tracking, and advanced data visualization capabilities.
 *
 * ARCHITECTURE FEATURES:
 * - Event-driven microservice following platform patterns
 * - PostHog integration for product analytics and feature flags
 * - Google Analytics 4 integration for web analytics
 * - Real-time dashboard updates with WebSocket support
 * - Advanced data visualization with D3.js and Observable Plot
 * - Automated report generation and scheduling
 * - Multi-dimensional analytics across all platform services
 *
 * KEY CAPABILITIES:
 * - Custom dashboard creation and management
 * - Real-time KPI tracking and alerting
 * - Advanced report generation with multiple formats
 * - Data export functionality (CSV, Excel, PDF, JSON)
 * - Cross-service analytics aggregation
 * - Role-based analytics access control
 *
 * INTEGRATIONS:
 * - Time Tracking Service metrics
 * - Expense Management analytics
 * - Shift Management performance data
 * - User behavior tracking via PostHog
 * - Web analytics via Google Analytics 4
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 * @since Phase 7 Implementation
 */

import { AnalyticsRepository } from "./repository";
import { analyticsEventPublisher } from "./events";
import {
  Dashboard,
  DashboardWidget,
  ReportTemplate,
  GeneratedReport,
  AnalyticsMetric,
  RealTimeMetric,
  CreateDashboardInput,
  UpdateDashboardInput,
  CreateReportTemplateInput,
  UpdateReportTemplateInput,
  AnalyticsServiceResponse,
  ChartType,
  TimePeriod,
  ReportStatus,
  PlatformKPIs,
  DashboardAnalytics,
  ExportConfig,
  AlertConfig,
} from "./models";
import { PostHogAnalytics } from "./integrations/PostHogAnalytics";
import { GA4Analytics } from "./integrations/GA4Analytics";
import { ReportGenerator } from "./utils/ReportGenerator";
import { MetricsCalculator } from "./utils/MetricsCalculator";

export class AnalyticsService {
  private repository: AnalyticsRepository;
  private postHogAnalytics: PostHogAnalytics;
  private ga4Analytics: GA4Analytics;
  private reportGenerator: ReportGenerator;
  private metricsCalculator: MetricsCalculator;

  constructor() {
    this.repository = new AnalyticsRepository();
    this.postHogAnalytics = new PostHogAnalytics();
    this.ga4Analytics = new GA4Analytics();
    this.reportGenerator = new ReportGenerator();
    this.metricsCalculator = new MetricsCalculator();
  }

  /**
   * Dashboard Management Operations
   */

  /**
   * Get all dashboards with role-based filtering
   * Applies RBAC to ensure users only see appropriate dashboards
   */
  async getDashboards(
    organizationId: string,
    userId: string,
    userRole: string,
    filters?: {
      category?: string;
      isPublic?: boolean;
      createdBy?: string;
      tags?: string[];
    },
  ): Promise<AnalyticsServiceResponse<Dashboard[]>> {
    try {
      // Apply role-based filtering
      const roleFilters = this.applyRoleBasedDashboardFiltering(
        filters || {},
        userRole,
        userId,
      );

      const result = await this.repository.findDashboards(
        organizationId,
        roleFilters,
      );

      if (!result.success) {
        return { success: false, error: result.error, code: result.code };
      }

      // Track dashboard list view in PostHog
      await this.postHogAnalytics.trackEvent("dashboard_list_viewed", {
        organizationId,
        userId,
        userRole,
        dashboardCount: result.data?.length || 0,
      });

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      return {
        success: false,
        error: "Failed to fetch dashboards",
        code: "DASHBOARD_FETCH_ERROR",
      };
    }
  }

  /**
   * Get dashboard by ID with access control
   * Validates user permissions before returning dashboard data
   */
  async getDashboardById(
    dashboardId: string,
    userId: string,
    userRole: string,
    organizationId: string,
  ): Promise<AnalyticsServiceResponse<Dashboard>> {
    try {
      const result = await this.repository.findDashboardById(dashboardId);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: "Dashboard not found",
          code: "DASHBOARD_NOT_FOUND",
        };
      }

      const dashboard = result.data;

      // Check access permissions
      if (
        !this.hasDashboardAccess(dashboard, userId, userRole, organizationId)
      ) {
        return {
          success: false,
          error: "Access denied",
          code: "DASHBOARD_ACCESS_DENIED",
        };
      }

      // Update view statistics
      await this.repository.updateDashboardViewStats(dashboardId, userId);

      // Track dashboard view in PostHog
      await this.postHogAnalytics.trackEvent("dashboard_viewed", {
        dashboardId,
        dashboardName: dashboard.name,
        userId,
        userRole,
        organizationId,
      });

      return { success: true, data: dashboard };
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      return {
        success: false,
        error: "Failed to fetch dashboard",
        code: "DASHBOARD_FETCH_ERROR",
      };
    }
  }

  /**
   * Create new dashboard
   * Creates dashboard with proper access controls and publishes events
   */
  async createDashboard(
    data: CreateDashboardInput,
    createdBy: string,
    userRole: string,
  ): Promise<AnalyticsServiceResponse<Dashboard>> {
    try {
      // Validate user permissions for dashboard creation
      if (!this.hasCreateDashboardPermissions(userRole)) {
        return {
          success: false,
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        };
      }

      // Create dashboard with audit trail
      const result = await this.repository.createDashboard({
        ...data,
        createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (!result.success || !result.data) {
        return { success: false, error: result.error, code: result.code };
      }

      const dashboard = result.data;

      // Publish dashboard created event
      await analyticsEventPublisher.publishDashboardCreated(
        dashboard,
        createdBy,
        data.organizationId,
      );

      // Track in PostHog
      await this.postHogAnalytics.trackEvent("dashboard_created", {
        dashboardId: dashboard.id,
        dashboardName: dashboard.name,
        category: dashboard.category,
        widgetCount: dashboard.layout.length,
        userId: createdBy,
        organizationId: data.organizationId,
      });

      return { success: true, data: dashboard };
    } catch (error) {
      console.error("Error creating dashboard:", error);
      return {
        success: false,
        error: "Failed to create dashboard",
        code: "DASHBOARD_CREATE_ERROR",
      };
    }
  }

  /**
   * Update existing dashboard
   * Updates dashboard with proper validation and event publishing
   */
  async updateDashboard(
    dashboardId: string,
    data: UpdateDashboardInput,
    updatedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<AnalyticsServiceResponse<Dashboard>> {
    try {
      // Fetch existing dashboard to validate access
      const existingResult =
        await this.repository.findDashboardById(dashboardId);

      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: "Dashboard not found",
          code: "DASHBOARD_NOT_FOUND",
        };
      }

      const existingDashboard = existingResult.data;

      // Check update permissions
      if (
        !this.hasUpdateDashboardPermissions(
          existingDashboard,
          updatedBy,
          userRole,
          organizationId,
        )
      ) {
        return {
          success: false,
          error: "Access denied",
          code: "DASHBOARD_UPDATE_DENIED",
        };
      }

      // Update dashboard
      const result = await this.repository.updateDashboard(dashboardId, {
        ...data,
        updated_at: new Date(),
      });

      if (!result.success || !result.data) {
        return { success: false, error: result.error, code: result.code };
      }

      const updatedDashboard = result.data;

      // Publish dashboard updated event
      await analyticsEventPublisher.publishDashboardUpdated(
        updatedDashboard,
        updatedBy,
        data,
        organizationId,
      );

      // Track in PostHog
      await this.postHogAnalytics.trackEvent("dashboard_updated", {
        dashboardId,
        dashboardName: updatedDashboard.name,
        userId: updatedBy,
        organizationId,
        changedFields: Object.keys(data),
      });

      return { success: true, data: updatedDashboard };
    } catch (error) {
      console.error("Error updating dashboard:", error);
      return {
        success: false,
        error: "Failed to update dashboard",
        code: "DASHBOARD_UPDATE_ERROR",
      };
    }
  }

  /**
   * Delete dashboard
   * Removes dashboard with proper access control and cleanup
   */
  async deleteDashboard(
    dashboardId: string,
    deletedBy: string,
    userRole: string,
    organizationId: string,
  ): Promise<AnalyticsServiceResponse<boolean>> {
    try {
      // Fetch existing dashboard to validate access
      const existingResult =
        await this.repository.findDashboardById(dashboardId);

      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: "Dashboard not found",
          code: "DASHBOARD_NOT_FOUND",
        };
      }

      const dashboard = existingResult.data;

      // Check delete permissions
      if (
        !this.hasDeleteDashboardPermissions(
          dashboard,
          deletedBy,
          userRole,
          organizationId,
        )
      ) {
        return {
          success: false,
          error: "Access denied",
          code: "DASHBOARD_DELETE_DENIED",
        };
      }

      // Delete dashboard
      const result = await this.repository.deleteDashboard(dashboardId);

      if (!result.success) {
        return { success: false, error: result.error, code: result.code };
      }

      // Publish dashboard deleted event
      await analyticsEventPublisher.publishDashboardDeleted(
        dashboardId,
        deletedBy,
        organizationId,
      );

      // Track in PostHog
      await this.postHogAnalytics.trackEvent("dashboard_deleted", {
        dashboardId,
        dashboardName: dashboard.name,
        userId: deletedBy,
        organizationId,
      });

      return { success: true, data: true };
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      return {
        success: false,
        error: "Failed to delete dashboard",
        code: "DASHBOARD_DELETE_ERROR",
      };
    }
  }

  /**
   * Real-time Metrics Operations
   */

  /**
   * Get real-time metrics for dashboard widgets
   * Fetches current metric values with caching for performance
   */
  async getRealTimeMetrics(
    organizationId: string,
    metricIds: string[],
    timePeriod: TimePeriod = TimePeriod.HOUR,
  ): Promise<AnalyticsServiceResponse<RealTimeMetric[]>> {
    try {
      const result = await this.repository.getRealTimeMetrics(
        organizationId,
        metricIds,
        timePeriod,
      );

      if (!result.success) {
        return { success: false, error: result.error, code: result.code };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error fetching real-time metrics:", error);
      return {
        success: false,
        error: "Failed to fetch real-time metrics",
        code: "METRICS_FETCH_ERROR",
      };
    }
  }

  /**
   * Calculate platform KPIs
   * Aggregates key performance indicators across all services
   */
  async calculatePlatformKPIs(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsServiceResponse<PlatformKPIs>> {
    try {
      const kpis = await this.metricsCalculator.calculatePlatformKPIs(
        organizationId,
        startDate,
        endDate,
      );

      return { success: true, data: kpis };
    } catch (error) {
      console.error("Error calculating platform KPIs:", error);
      return {
        success: false,
        error: "Failed to calculate KPIs",
        code: "KPI_CALCULATION_ERROR",
      };
    }
  }

  /**
   * Report Generation Operations
   */

  /**
   * Generate report from template
   * Creates report instance with data population and formatting
   */
  async generateReport(
    templateId: string,
    parameters: Record<string, any>,
    generatedBy: string,
    organizationId: string,
  ): Promise<AnalyticsServiceResponse<GeneratedReport>> {
    try {
      // Fetch report template
      const templateResult =
        await this.repository.findReportTemplateById(templateId);

      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          error: "Report template not found",
          code: "TEMPLATE_NOT_FOUND",
        };
      }

      const template = templateResult.data;

      // Generate report
      const reportResult = await this.reportGenerator.generateReport(
        template,
        parameters,
        generatedBy,
        organizationId,
      );

      if (!reportResult.success || !reportResult.data) {
        return {
          success: false,
          error: reportResult.error,
          code: reportResult.code,
        };
      }

      const report = reportResult.data;

      // Publish report generated event
      await analyticsEventPublisher.publishReportGenerated(
        report,
        generatedBy,
        organizationId,
      );

      // Track in PostHog
      await this.postHogAnalytics.trackEvent("report_generated", {
        reportId: report.id,
        templateId,
        templateName: template.name,
        format: report.format,
        userId: generatedBy,
        organizationId,
      });

      return { success: true, data: report };
    } catch (error) {
      console.error("Error generating report:", error);
      return {
        success: false,
        error: "Failed to generate report",
        code: "REPORT_GENERATION_ERROR",
      };
    }
  }

  /**
   * Data Export Operations
   */

  /**
   * Export analytics data
   * Exports data in specified format with proper formatting
   */
  async exportData(
    query: string,
    config: ExportConfig,
    userId: string,
    organizationId: string,
  ): Promise<
    AnalyticsServiceResponse<{ downloadUrl: string; fileName: string }>
  > {
    try {
      const exportResult = await this.repository.exportData(
        query,
        config,
        organizationId,
      );

      if (!exportResult.success || !exportResult.data) {
        return {
          success: false,
          error: exportResult.error,
          code: exportResult.code,
        };
      }

      // Track export in PostHog
      await this.postHogAnalytics.trackEvent("data_exported", {
        format: config.format,
        recordCount: exportResult.data.recordCount,
        userId,
        organizationId,
      });

      return {
        success: true,
        data: {
          downloadUrl: exportResult.data.downloadUrl,
          fileName: exportResult.data.fileName,
        },
      };
    } catch (error) {
      console.error("Error exporting data:", error);
      return {
        success: false,
        error: "Failed to export data",
        code: "DATA_EXPORT_ERROR",
      };
    }
  }

  /**
   * Integration Operations
   */

  /**
   * Track custom event in PostHog
   * Sends custom events to PostHog for product analytics
   */
  async trackCustomEvent(
    eventName: string,
    properties: Record<string, any>,
    userId: string,
    organizationId: string,
  ): Promise<AnalyticsServiceResponse<boolean>> {
    try {
      await this.postHogAnalytics.trackEvent(eventName, {
        ...properties,
        userId,
        organizationId,
        timestamp: new Date().toISOString(),
      });

      return { success: true, data: true };
    } catch (error) {
      console.error("Error tracking custom event:", error);
      return {
        success: false,
        error: "Failed to track event",
        code: "EVENT_TRACKING_ERROR",
      };
    }
  }

  /**
   * Get GA4 analytics data
   * Retrieves analytics data from Google Analytics 4
   */
  async getGA4Analytics(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    metrics: string[],
    dimensions: string[],
  ): Promise<AnalyticsServiceResponse<any[]>> {
    try {
      const analyticsData = await this.ga4Analytics.getAnalyticsData(
        organizationId,
        startDate,
        endDate,
        metrics,
        dimensions,
      );

      return { success: true, data: analyticsData };
    } catch (error) {
      console.error("Error fetching GA4 analytics:", error);
      return {
        success: false,
        error: "Failed to fetch GA4 analytics",
        code: "GA4_FETCH_ERROR",
      };
    }
  }

  /**
   * Private Helper Methods
   */

  /**
   * Apply role-based filtering to dashboard queries
   */
  private applyRoleBasedDashboardFiltering(
    filters: any,
    userRole: string,
    userId: string,
  ): any {
    const roleFilters = { ...filters };

    switch (userRole) {
      case "brand_agent":
        // Brand agents can only see public dashboards or their own
        roleFilters.accessFilter = {
          or: [{ isPublic: true }, { createdBy: userId }],
        };
        break;

      case "internal_field_manager":
        // Field managers can see organization dashboards
        break;

      case "organization_admin":
        // Organization admins can see all organization dashboards
        break;

      case "super_admin":
        // Super admins can see all dashboards
        break;

      default:
        roleFilters.accessFilter = { createdBy: userId };
    }

    return roleFilters;
  }

  /**
   * Check if user has access to specific dashboard
   */
  private hasDashboardAccess(
    dashboard: Dashboard,
    userId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    // Organization check
    if (
      dashboard.organizationId !== organizationId &&
      userRole !== "super_admin"
    ) {
      return false;
    }

    // Public dashboard access
    if (dashboard.isPublic) {
      return true;
    }

    // Owner access
    if (dashboard.createdBy === userId) {
      return true;
    }

    // Shared access
    if (dashboard.sharedWith?.some((share) => share.userId === userId)) {
      return true;
    }

    // Role-based access
    switch (userRole) {
      case "super_admin":
        return true;
      case "organization_admin":
        return dashboard.organizationId === organizationId;
      case "internal_field_manager":
        return dashboard.organizationId === organizationId;
      default:
        return false;
    }
  }

  /**
   * Check dashboard creation permissions
   */
  private hasCreateDashboardPermissions(userRole: string): boolean {
    return [
      "super_admin",
      "organization_admin",
      "internal_field_manager",
    ].includes(userRole);
  }

  /**
   * Check dashboard update permissions
   */
  private hasUpdateDashboardPermissions(
    dashboard: Dashboard,
    userId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    // Owner can always update
    if (dashboard.createdBy === userId) {
      return true;
    }

    // Check shared access with edit permission
    if (
      dashboard.sharedWith?.some(
        (share) => share.userId === userId && share.permission === "edit",
      )
    ) {
      return true;
    }

    // Role-based update permissions
    switch (userRole) {
      case "super_admin":
        return true;
      case "organization_admin":
        return dashboard.organizationId === organizationId;
      default:
        return false;
    }
  }

  /**
   * Check dashboard delete permissions
   */
  private hasDeleteDashboardPermissions(
    dashboard: Dashboard,
    userId: string,
    userRole: string,
    organizationId: string,
  ): boolean {
    // Owner can always delete
    if (dashboard.createdBy === userId) {
      return true;
    }

    // Role-based delete permissions
    switch (userRole) {
      case "super_admin":
        return true;
      case "organization_admin":
        return dashboard.organizationId === organizationId;
      default:
        return false;
    }
  }
}
