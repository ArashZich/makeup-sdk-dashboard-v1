// src/api/types/analytics.types.ts - آپدیت شده
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

// مدل اطلاعات محصول در آنالیتیکس - جدید
export interface ProductInfo {
  productId: string;
  productUid: string;
  productName: string;
}

// مدل آنالیتیکس استفاده - آپدیت شده
export interface UsageAnalytics {
  totalRequests: number;
  browserStats: Record<string, number>;
  deviceStats: Record<string, number>;
  osStats: Record<string, number>;
  timeDistribution: TimeDistribution;
  successRate: SuccessRate;
  productInfo?: ProductInfo; // اختیاری - فقط برای آنالیتیکس محصول خاص
}

// درخواست آنالیتیکس - آپدیت شده
export interface AnalyticsRequest {
  timeRange?: TimeRange;
  productId?: string; // جدید
  productUid?: string; // جدید
}

// درخواست دانلود آنالیتیکس - جدید
export interface DownloadAnalyticsRequest {
  productId?: string;
  productUid?: string;
}
