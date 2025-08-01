/**
 * Analytics & BI Dashboard Models
 *
 * Enterprise-grade business intelligence models for comprehensive reporting,
 * real-time analytics, and data visualization across the Rishi platform.
 *
 * INTEGRATIONS:
 * - PostHog for product analytics and feature flags
 * - Google Analytics 4 for web analytics and user behavior
 * - Custom metrics and KPIs for workforce management
 * - Real-time dashboard updates and notifications
 *
 * FEATURES:
 * - Multi-dimensional analytics across all platform services
 * - Custom report generation with export capabilities
 * - Real-time metrics tracking and alerting
 * - Advanced data visualization with D3.js and Observable Plot
 * - Automated report scheduling and distribution
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 * @since Phase 7 Implementation
 */

import { z } from "zod";

/**
 * Analytics Data Types
 * Defines the types of analytics data collected
 */
export enum AnalyticsDataType {
  USER_BEHAVIOR = "user_behavior",
  PERFORMANCE_METRICS = "performance_metrics",
  BUSINESS_METRICS = "business_metrics",
  OPERATIONAL_METRICS = "operational_metrics",
  FINANCIAL_METRICS = "financial_metrics",
  QUALITY_METRICS = "quality_metrics",
}

/**
 * Chart Types for Visualization
 * Supported chart types for dashboard components
 */
export enum ChartType {
  LINE = "line",
  BAR = "bar",
  AREA = "area",
  PIE = "pie",
  DONUT = "donut",
  SCATTER = "scatter",
  HEATMAP = "heatmap",
  GAUGE = "gauge",
  FUNNEL = "funnel",
  TREEMAP = "treemap",
  SANKEY = "sankey",
  TIMELINE = "timeline",
}

/**
 * Time Period Aggregations
 * Standard time periods for analytics aggregation
 */
export enum TimePeriod {
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

/**
 * Report Status
 * Status tracking for generated reports
 */
export enum ReportStatus {
  DRAFT = "draft",
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
  SCHEDULED = "scheduled",
}

/**
 * Dashboard Widget Model
 * Individual widgets for dashboard composition
 */
export const DashboardWidgetSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Widget title is required"),
  description: z.string().optional(),
  type: z.nativeEnum(ChartType),
  dataSource: z.string(), // Query or data endpoint

  // Widget configuration
  config: z.object({
    width: z.number().min(1).max(12).default(6), // Grid width (1-12)
    height: z.number().min(1).default(4), // Grid height
    refreshInterval: z.number().min(0).default(300), // Seconds

    // Chart-specific configuration
    xAxis: z.string().optional(),
    yAxis: z.string().optional(),
    groupBy: z.string().optional(),
    aggregation: z.enum(["sum", "avg", "count", "min", "max"]).default("sum"),

    // Styling
    colors: z.array(z.string()).optional(),
    showLegend: z.boolean().default(true),
    showTooltip: z.boolean().default(true),

    // Filters
    filters: z.record(z.any()).optional(),
    dateRange: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .optional(),
  }),

  // Position and layout
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1).max(12),
    h: z.number().min(1),
  }),

  // Access control
  organizationId: z.string().uuid(),
  createdBy: z.string().uuid(),
  isPublic: z.boolean().default(false),
  allowedRoles: z.array(z.string()).optional(),

  // Metadata
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Dashboard Model
 * Complete dashboard with widgets and layout
 */
export const DashboardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Dashboard name is required"),
  description: z.string().optional(),

  // Dashboard configuration
  layout: z.array(DashboardWidgetSchema),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  refreshInterval: z.number().min(0).default(300), // Global refresh interval

  // Access control
  organizationId: z.string().uuid(),
  createdBy: z.string().uuid(),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  sharedWith: z
    .array(
      z.object({
        userId: z.string().uuid(),
        permission: z.enum(["view", "edit"]),
      }),
    )
    .optional(),

  // Categorization
  category: z
    .enum([
      "executive",
      "operations",
      "financial",
      "hr",
      "performance",
      "custom",
    ])
    .default("custom"),
  tags: z.array(z.string()).optional(),

  // Metadata
  lastViewedAt: z.date().optional(),
  viewCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Analytics Metric Model
 * Individual metrics tracked across the platform
 */
export const AnalyticsMetricSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),

  // Metric configuration
  type: z.nativeEnum(AnalyticsDataType),
  unit: z.string().optional(), // e.g., 'hours', 'dollars', 'count'
  format: z
    .enum(["number", "currency", "percentage", "duration"])
    .default("number"),

  // Calculation details
  calculation: z.object({
    source: z.string(), // Table or view name
    field: z.string(), // Field to aggregate
    aggregation: z.enum(["sum", "avg", "count", "min", "max", "distinct"]),
    filters: z.record(z.any()).optional(),
    groupBy: z.array(z.string()).optional(),
  }),

  // Thresholds and alerts
  thresholds: z
    .object({
      warning: z.number().optional(),
      critical: z.number().optional(),
      target: z.number().optional(),
    })
    .optional(),

  // Access control
  organizationId: z.string().uuid(),
  isActive: z.boolean().default(true),

  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Report Template Model
 * Reusable report templates for automated generation
 */
export const ReportTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Report name is required"),
  description: z.string().optional(),

  // Report configuration
  type: z.enum([
    "summary",
    "detailed",
    "executive",
    "operational",
    "financial",
  ]),
  format: z.enum(["pdf", "excel", "csv", "json"]).default("pdf"),

  // Content definition
  sections: z.array(
    z.object({
      title: z.string(),
      type: z.enum(["text", "chart", "table", "metric"]),
      content: z.object({
        query: z.string().optional(),
        chartType: z.nativeEnum(ChartType).optional(),
        columns: z.array(z.string()).optional(),
        formatting: z.record(z.any()).optional(),
      }),
    }),
  ),

  // Scheduling
  schedule: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
      time: z.string(), // HH:MM format
      timezone: z.string().default("UTC"),
      recipients: z.array(
        z.object({
          email: z.string().email(),
          name: z.string(),
        }),
      ),
    })
    .optional(),

  // Filters and parameters
  parameters: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["date", "select", "text", "number"]),
        required: z.boolean().default(false),
        defaultValue: z.any().optional(),
        options: z.array(z.any()).optional(),
      }),
    )
    .optional(),

  // Access control
  organizationId: z.string().uuid(),
  createdBy: z.string().uuid(),
  isActive: z.boolean().default(true),

  // Metadata
  lastGeneratedAt: z.date().optional(),
  generationCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Generated Report Model
 * Individual report instances
 */
export const GeneratedReportSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  name: z.string(),

  // Report details
  status: z.nativeEnum(ReportStatus),
  format: z.enum(["pdf", "excel", "csv", "json"]),

  // Generation details
  parameters: z.record(z.any()),
  generatedBy: z.string().uuid(),
  generatedAt: z.date(),

  // File details
  fileName: z.string().optional(),
  fileSize: z.number().optional(), // Bytes
  downloadUrl: z.string().optional(),
  expiresAt: z.date().optional(),

  // Execution details
  executionTime: z.number().optional(), // Milliseconds
  errorMessage: z.string().optional(),

  // Access tracking
  downloadCount: z.number().default(0),
  lastDownloadedAt: z.date().optional(),

  // Metadata
  organizationId: z.string().uuid(),
});

/**
 * Real-time Metrics Model
 * Live metrics for dashboard real-time updates
 */
export const RealTimeMetricSchema = z.object({
  id: z.string().uuid(),
  metricId: z.string().uuid(),
  organizationId: z.string().uuid(),

  // Metric value and context
  value: z.number(),
  previousValue: z.number().optional(),
  change: z.number().optional(), // Percentage change
  changeType: z.enum(["increase", "decrease", "stable"]).optional(),

  // Time context
  timestamp: z.date(),
  period: z.nativeEnum(TimePeriod),

  // Additional context
  dimensions: z.record(z.string()).optional(), // e.g., { "location": "store-1", "brand": "brand-a" }
  metadata: z.record(z.any()).optional(),
});

/**
 * PostHog Integration Model
 * Configuration for PostHog analytics integration
 */
export const PostHogConfigSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),

  // PostHog configuration
  projectApiKey: z.string(),
  host: z.string().default("https://app.posthog.com"),

  // Event tracking configuration
  trackPageViews: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
  trackFormSubmissions: z.boolean().default(true),
  trackScrollDepth: z.boolean().default(false),

  // Feature flags
  enableFeatureFlags: z.boolean().default(true),

  // User identification
  identifyUsers: z.boolean().default(true),
  userProperties: z.array(z.string()).optional(),

  // Privacy settings
  respectDoNotTrack: z.boolean().default(true),
  maskAllText: z.boolean().default(false),
  maskAllInputs: z.boolean().default(true),

  // Session recording
  enableSessionRecording: z.boolean().default(false),
  recordingConfig: z
    .object({
      maskAllText: z.boolean().default(true),
      maskAllInputs: z.boolean().default(true),
      recordCrossOriginIframes: z.boolean().default(false),
    })
    .optional(),

  // Metadata
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Google Analytics 4 Integration Model
 * Configuration for GA4 integration
 */
export const GA4ConfigSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),

  // GA4 configuration
  measurementId: z.string(), // G-XXXXXXXXXX
  propertyId: z.string().optional(),

  // Tracking configuration
  trackPageViews: z.boolean().default(true),
  trackScrolling: z.boolean().default(true),
  trackOutboundClicks: z.boolean().default(true),
  trackFileDownloads: z.boolean().default(true),
  trackVideoEngagement: z.boolean().default(false),

  // Enhanced ecommerce (for future use)
  enableEnhancedEcommerce: z.boolean().default(false),

  // Custom dimensions and metrics
  customDimensions: z
    .array(
      z.object({
        index: z.number(),
        name: z.string(),
        parameter: z.string(),
      }),
    )
    .optional(),

  customMetrics: z
    .array(
      z.object({
        index: z.number(),
        name: z.string(),
        parameter: z.string(),
      }),
    )
    .optional(),

  // Data retention and privacy
  anonymizeIp: z.boolean().default(true),
  respectDoNotTrack: z.boolean().default(true),

  // Reporting API configuration
  enableReportingApi: z.boolean().default(false),
  serviceAccountEmail: z.string().optional(),
  privateKeyId: z.string().optional(),

  // Metadata
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports for TypeScript usage
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;
export type GeneratedReport = z.infer<typeof GeneratedReportSchema>;
export type RealTimeMetric = z.infer<typeof RealTimeMetricSchema>;
export type PostHogConfig = z.infer<typeof PostHogConfigSchema>;
export type GA4Config = z.infer<typeof GA4ConfigSchema>;

// Create schemas for API operations
export const CreateDashboardSchema = DashboardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastViewedAt: true,
  viewCount: true,
});

export const UpdateDashboardSchema = CreateDashboardSchema.partial();

export const CreateReportTemplateSchema = ReportTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastGeneratedAt: true,
  generationCount: true,
});

export const UpdateReportTemplateSchema = CreateReportTemplateSchema.partial();

// Input types for API
export type CreateDashboardInput = z.infer<typeof CreateDashboardSchema>;
export type UpdateDashboardInput = z.infer<typeof UpdateDashboardSchema>;
export type CreateReportTemplateInput = z.infer<
  typeof CreateReportTemplateSchema
>;
export type UpdateReportTemplateInput = z.infer<
  typeof UpdateReportTemplateSchema
>;

/**
 * Analytics Service Response Interface
 * Standardized response format for analytics operations
 */
export interface AnalyticsServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
    executionTime?: number;
  };
}

/**
 * Dashboard Analytics
 * Usage analytics for dashboards
 */
export interface DashboardAnalytics {
  dashboardId: string;
  viewCount: number;
  uniqueViewers: number;
  averageViewTime: number; // seconds
  lastViewedAt: Date;
  popularWidgets: Array<{
    widgetId: string;
    title: string;
    interactionCount: number;
  }>;
  performanceMetrics: {
    averageLoadTime: number; // milliseconds
    errorRate: number; // percentage
    refreshRate: number; // per hour
  };
}

/**
 * Platform KPIs
 * Key performance indicators for the Rishi platform
 */
export interface PlatformKPIs {
  // User engagement
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };

  // Operational metrics
  shiftsCompleted: number;
  averageShiftDuration: number; // hours
  shiftCompletionRate: number; // percentage

  // Financial metrics
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  averageExpenseAmount: number;

  // Efficiency metrics
  timeUtilization: number; // percentage
  scheduleAdherence: number; // percentage
  conflictResolutionTime: number; // hours

  // Quality metrics
  customerSatisfactionScore: number;
  taskCompletionRate: number; // percentage
  errorRate: number; // percentage
}

/**
 * Export Configuration
 * Settings for data export functionality
 */
export interface ExportConfig {
  format: "csv" | "excel" | "json" | "pdf";
  includeHeaders: boolean;
  dateFormat: string;
  timezone: string;
  filters?: Record<string, any>;
  fields?: string[];
  maxRows?: number;
}

/**
 * Alert Configuration
 * Settings for real-time alerts and notifications
 */
export interface AlertConfig {
  id: string;
  name: string;
  metricId: string;
  condition: {
    operator: "gt" | "lt" | "eq" | "gte" | "lte";
    threshold: number;
  };
  frequency: "immediate" | "hourly" | "daily";
  channels: Array<{
    type: "email" | "sms" | "slack" | "webhook";
    target: string;
  }>;
  isActive: boolean;
}
