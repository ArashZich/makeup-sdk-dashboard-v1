// src/api/types/plans.types.ts - آپدیت شده
import { PaginatedResponse } from "@/types/common.types";

// انواع پلتفرم‌ها
export type TargetPlatform = "all" | "normal" | "divar" | "torob" | "basalam";

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

// مدل پلن - آپدیت شده با targetPlatforms
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
  targetPlatforms: TargetPlatform[]; // فیلد جدید اضافه شده
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی پلن‌ها
export interface PlanFilters {
  name?: string;
  active?: boolean;
  specialOffer?: boolean;
  targetPlatforms?: TargetPlatform; // فیلتر جدید
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد پلن - آپدیت شده
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
  targetPlatforms: TargetPlatform[]; // فیلد جدید
}

// مدل درخواست به‌روزرسانی پلن - آپدیت شده
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
  targetPlatforms?: TargetPlatform[]; // فیلد جدید
}

// تایپ پاسخ صفحه‌بندی شده پلن‌ها
export type PaginatedPlans = PaginatedResponse<Plan>;
