// src/lib/safe-data-utils.ts

/**
 * Utility functions for safely handling undefined/null data in analytics and charts
 */

import { SuccessRate } from "@/api/types/analytics.types";

/**
 * Safely converts object to key-value pairs for charts
 * @param data - Object that might be undefined or null
 * @returns Safe object with guaranteed structure
 */
export function safeObjectData(
  data: Record<string, number> | undefined | null
): {
  data: Record<string, number>;
  labels: string[];
  values: number[];
  total: number;
  hasData: boolean;
} {
  const safeData = data || {};
  const labels = Object.keys(safeData);
  const values = Object.values(safeData);
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    data: safeData,
    labels,
    values,
    total,
    hasData: total > 0,
  };
}

/**
 * Safely handles time distribution data for analytics
 * @param timeDistribution - Time distribution object that might be undefined
 * @returns Safe time distribution data
 */
export function safeTimeDistribution(timeDistribution?: {
  byHour?: Record<string, number>;
  byDay?: Record<string, number>;
  byDate?: Record<string, number>;
}) {
  return {
    byHour: timeDistribution?.byHour || {},
    byDay: timeDistribution?.byDay || {},
    byDate: timeDistribution?.byDate || {},
  };
}

/**
 * Safely handles success rate data
 * @param successRate - Success rate object that might be undefined
 * @returns Safe success rate data
 */
export function safeSuccessRate(successRate?: SuccessRate | null): {
  success: number;
  failed: number;
  rate: string;
  total: number;
  hasData: boolean;
} {
  const safeData = {
    success: successRate?.success || 0,
    failed: successRate?.failed || 0,
    rate: successRate?.rate || "0%",
  };

  const total = safeData.success + safeData.failed;

  return {
    ...safeData,
    total,
    hasData: total > 0,
  };
}

/**
 * Finds the top item in a stats object
 * @param stats - Stats object that might be undefined
 * @returns Top item key or default text
 */
export function getTopItem(
  stats: Record<string, number> | undefined | null,
  defaultText: string = "-"
): string {
  if (!stats || Object.keys(stats).length === 0) return defaultText;

  let maxItem = "";
  let maxValue = 0;

  for (const [key, value] of Object.entries(stats)) {
    if (value > maxValue) {
      maxValue = value;
      maxItem = key;
    }
  }

  return maxItem || defaultText;
}

/**
 * Safely converts time distribution data for chart usage
 * @param timeDistribution - Time distribution object
 * @param dataKey - Which key to use (byDate, byHour, byDay)
 * @returns Chart-ready data
 */
export function safeChartData(
  timeDistribution?: {
    byHour?: Record<string, number>;
    byDay?: Record<string, number>;
    byDate?: Record<string, number>;
  },
  dataKey: "byDate" | "byHour" | "byDay" = "byDate"
): {
  categories: string[];
  values: number[];
  hasData: boolean;
} {
  const safeData = safeTimeDistribution(timeDistribution);
  const targetData = safeData[dataKey];

  const categories = Object.keys(targetData);
  const values = Object.values(targetData).map((value) => Number(value) || 0);
  const hasData = values.some((value) => value > 0);

  return {
    categories,
    values,
    hasData,
  };
}

/**
 * Safely handles analytics data structure
 * @param analytics - Analytics object that might be undefined
 * @returns Safe analytics data
 */
export function safeAnalyticsData(analytics?: {
  totalRequests?: number;
  browserStats?: Record<string, number>;
  deviceStats?: Record<string, number>;
  osStats?: Record<string, number>;
  timeDistribution?: {
    byHour?: Record<string, number>;
    byDay?: Record<string, number>;
    byDate?: Record<string, number>;
  };
  successRate?: SuccessRate;
}) {
  return {
    totalRequests: analytics?.totalRequests || 0,
    browserStats: safeObjectData(analytics?.browserStats),
    deviceStats: safeObjectData(analytics?.deviceStats),
    osStats: safeObjectData(analytics?.osStats),
    timeDistribution: safeTimeDistribution(analytics?.timeDistribution),
    successRate: safeSuccessRate(analytics?.successRate),
    hasAnyData: (analytics?.totalRequests || 0) > 0,
  };
}

/**
 * Creates empty state message component data
 * @param title - Title for empty state
 * @param description - Description for empty state
 * @returns Empty state data
 */
export function createEmptyState(
  title: string = "داده‌ای موجود نیست",
  description: string = "هنوز آماری ثبت نشده است"
) {
  return {
    title,
    description,
  };
}

/**
 * Safely calculates percentages for pie charts
 * @param values - Array of values
 * @returns Array of percentages
 */
export function safePercentages(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return values.map(() => 0);

  return values.map((value) => (value / total) * 100);
}

/**
 * Validates if data is suitable for chart display
 * @param data - Data to validate
 * @returns Whether data can be displayed in chart
 */
export function canDisplayChart(
  data: Record<string, number> | number[] | undefined | null
): boolean {
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.length > 0 && data.some((value) => value > 0);
  }

  const values = Object.values(data);
  return values.length > 0 && values.some((value) => value > 0);
}

/**
 * Format number safely for display
 * @param value - Number value that might be undefined
 * @param locale - Locale for formatting
 * @param fallback - Fallback value
 * @returns Formatted number string
 */
export function safeNumberFormat(
  value: number | undefined | null,
  locale: string = "fa-IR",
  fallback: string = "0"
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }

  return value.toLocaleString(locale);
}
