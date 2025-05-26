// src/api/types/revenue-stats.types.ts - آپدیت شده
// تایپ‌های مربوط به آمار درآمد بر اساس پلتفرم

// انواع پلتفرم‌ها برای آمار درآمد
export type RevenuePlatform = "normal" | "divar" | "torob" | "basalam";

// آمار درآمد یک پلتفرم
export interface PlatformRevenueStats {
  totalRevenue: number; // کل درآمد به ریال
  totalOrders: number; // تعداد کل سفارش‌ها
  avgOrderValue: number; // میانگین ارزش سفارش
}

// آمار کلی درآمد
export interface TotalRevenueStats {
  totalRevenue: number; // کل درآمد همه پلتفرم‌ها
  totalOrders: number; // کل سفارش‌های همه پلتفرم‌ها
}

// پاسخ API آمار درآمد - حالت کلی (بدون فیلتر پلتفرم)
export interface RevenueStatsResponse {
  normal: PlatformRevenueStats;
  divar: PlatformRevenueStats;
  torob?: PlatformRevenueStats; // اختیاری چون ممکنه هنوز پیاده نشده باشه
  basalam?: PlatformRevenueStats; // اختیاری چون ممکنه هنوز پیاده نشده باشه
  total: TotalRevenueStats;
}

// پاسخ API آمار درآمد - حالت فیلتر شده (با پلتفرم خاص)
export type FilteredRevenueStatsResponse = PlatformRevenueStats;

// درخواست آمار درآمد
export interface RevenueStatsRequest {
  platform?: RevenuePlatform; // فیلتر پلتفرم خاص (اختیاری)
  startDate?: string; // تاریخ شروع (فرمت: YYYY-MM-DD)
  endDate?: string; // تاریخ پایان (فرمت: YYYY-MM-DD)
}
