// src/api/types/analytics.types.ts

// انواع بازه زمانی آنالیتیکس
export type TimeRange = "week" | "month" | "halfyear" | "year" | "all";

// مدل توزیع زمانی آنالیتیکس
export interface TimeDistribution {
  byHour: Record<string, number>;
  byDay: Record<string, number>;
  byDate: Record<string, number>;
}

// مدل نرخ موفقیت آنالیتیکس
export interface SuccessRate {
  success: number;
  failed: number;
  rate: string;
}

// مدل آنالیتیکس استفاده
export interface UsageAnalytics {
  totalRequests: number;
  browserStats: Record<string, number>;
  deviceStats: Record<string, number>;
  osStats: Record<string, number>;
  timeDistribution: TimeDistribution;
  successRate: SuccessRate;
}
