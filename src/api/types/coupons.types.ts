// src/api/types/coupons.types.ts
import { PaginatedResponse } from "@/types/common.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";

// مدل کوپن
export interface Coupon {
  _id: string;
  code: string;
  description: string;
  percent: number;
  maxAmount: number;
  maxUsage: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  forPlans: string[] | Plan[];
  forUsers: string[] | User[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی کوپن‌ها
export interface CouponFilters {
  code?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

// مدل درخواست اعتبارسنجی کوپن
export interface ValidateCouponRequest {
  code: string;
  planId: string;
}

// مدل پاسخ اعتبارسنجی کوپن
export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalPrice?: number;
}

// مدل درخواست ایجاد کوپن
export interface CreateCouponRequest {
  code: string;
  description: string;
  percent: number;
  maxAmount: number;
  maxUsage: number;
  startDate: string;
  endDate: string;
  forPlans?: string[];
  forUsers?: string[];
  active: boolean;
}

// مدل درخواست به‌روزرسانی کوپن
export interface UpdateCouponRequest {
  description?: string;
  percent?: number;
  maxAmount?: number;
  maxUsage?: number;
  startDate?: string;
  endDate?: string;
  forPlans?: string[];
  forUsers?: string[];
  active?: boolean;
}

// تایپ پاسخ صفحه‌بندی شده کوپن‌ها
export type PaginatedCoupons = PaginatedResponse<Coupon>;
