// src/api/types/plans.types.ts
import { PaginatedResponse } from "@/types/common.types";

// مدل ویژگی‌های پیش‌فرض SDK
export interface DefaultSdkFeatures {
  features: string[];
  patterns: Record<string, string[]>;
  mediaFeatures?: {
    allowedSources: string[];
    allowedViews: string[];
    comparisonModes: string[];
  };
}

// مدل محدودیت درخواست
export interface RequestLimit {
  monthly: number;
  total: number;
}

// مدل پلن
export interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  requestLimit: RequestLimit;
  defaultSdkFeatures: DefaultSdkFeatures;
  active: boolean;
  specialOffer: boolean;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی پلن‌ها
export interface PlanFilters {
  name?: string;
  active?: boolean;
  specialOffer?: boolean;
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد پلن
export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  requestLimit: RequestLimit;
  defaultSdkFeatures: DefaultSdkFeatures;
  active: boolean;
  specialOffer: boolean;
}

// مدل درخواست به‌روزرسانی پلن
export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  features?: string[];
  requestLimit?: RequestLimit;
  defaultSdkFeatures?: DefaultSdkFeatures;
  active?: boolean;
  specialOffer?: boolean;
}

// تایپ پاسخ صفحه‌بندی شده پلن‌ها
export type PaginatedPlans = PaginatedResponse<Plan>;
