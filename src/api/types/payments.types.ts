// src/api/types/payments.types.ts
import { PaginatedResponse } from "@/types/common.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";

// نوع وضعیت پرداخت
export type PaymentStatus = "pending" | "success" | "failed" | "canceled";

// مدل پرداخت
export interface Payment {
  _id: string;
  userId: string | User;
  planId: string | Plan;
  amount: number;
  originalAmount?: number;
  couponId?: string;
  clientRefId?: string;
  paymentCode?: string;
  paymentRefId?: string;
  cardNumber?: string;
  cardHashPan?: string;
  payedDate?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی پرداخت‌ها
export interface PaymentFilters {
  userId?: string;
  planId?: string;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد پرداخت
export interface CreatePaymentRequest {
  planId: string;
  couponCode?: string;
}

// مدل پاسخ ایجاد پرداخت
export interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl: string;
  code: string;
  amount: number;
  discount: number;
  finalAmount: number;
  taxAmount: number; // 🆕 جدید
  finalAmountWithTax: number; // 🆕 جدید
}

// تایپ پاسخ صفحه‌بندی شده پرداخت‌ها
export type PaginatedPayments = PaginatedResponse<Payment>;

// ========== آمار درآمد ==========

// انواع پلتفرم‌ها برای آمار درآمد
export type PaymentsPlatform = "normal" | "divar" | "torob" | "basalam";

// انواع بازه زمانی
export type PaymentsTimeRange = "week" | "month" | "halfyear" | "year" | "all";

// آمار خلاصه
export interface PaymentsSummary {
  totalRevenue: number; // کل درآمد به ریال
  totalOrders: number; // تعداد کل سفارش‌ها
  avgOrderValue: number; // میانگین ارزش سفارش
  successRate?: string; // نرخ موفقیت (درصد)
  growthRate?: string; // نرخ رشد (درصد)
}

// مقایسه با دوره قبل
export interface PaymentsComparison {
  previousPeriod: PaymentsSummary;
  growth: {
    revenue: string; // نرخ رشد درآمد (درصد)
    orders: string; // نرخ رشد سفارش (درصد)
  };
}

// آمار یک پلتفرم
export interface PaymentsPlatformStats extends PaymentsSummary {
  comparison?: PaymentsComparison;
}

// آمار چارت زمانی
export interface PaymentsTimeChart {
  date: string; // تاریخ (YYYY-MM-DD یا YYYY-MM)
  revenue: number; // درآمد آن روز/ماه
  orders: number; // تعداد سفارش آن روز/ماه
}

// پرفروش‌ترین پلن‌ها
export interface PaymentsTopPlan {
  _id: string; // شناسه پلن
  planName: string; // نام پلن
  planPrice: number; // قیمت پلن
  totalRevenue: number; // کل درآمد این پلن
  totalSales: number; // تعداد فروش
}

// آمار کوپن‌ها (فقط برای پلتفرم خاص)
export interface PaymentsCouponStats {
  totalDiscountAmount: number; // کل مبلغ تخفیف داده شده
  totalCouponUsage: number; // تعداد استفاده از کوپن
}

// پاسخ API آمار درآمد - حالت کلی (همه پلتفرم‌ها)
export interface PaymentsAllPlatformsStatsResponse {
  summary: PaymentsSummary;
  platforms: {
    normal: PaymentsPlatformStats;
    divar: PaymentsPlatformStats;
    torob?: PaymentsPlatformStats; // اختیاری
    basalam?: PaymentsPlatformStats; // اختیاری
  };
  timeChart: PaymentsTimeChart[];
  topPlans: PaymentsTopPlan[];
  timeRange: PaymentsTimeRange;
}

// پاسخ API آمار درآمد - حالت پلتفرم خاص
export interface PaymentsPlatformSpecificStatsResponse {
  summary: PaymentsPlatformStats;
  timeChart: PaymentsTimeChart[];
  topPlans: PaymentsTopPlan[];
  couponStats?: PaymentsCouponStats; // فقط برای پلتفرم خاص
  timeRange: PaymentsTimeRange;
  platform: PaymentsPlatform;
}

// درخواست آمار درآمد
export interface PaymentsStatsRequest {
  platform?: PaymentsPlatform; // فیلتر پلتفرم خاص (اختیاری)
  timeRange?: PaymentsTimeRange; // بازه زمانی (پیش‌فرض: month)
}
