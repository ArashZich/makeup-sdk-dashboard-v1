// src/api/types/packages.types.ts
import { PaginatedResponse } from "@/types/common.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";

// نوع وضعیت بسته
export type PackageStatus = "active" | "expired" | "suspended";

// مدل ویژگی‌های SDK
export interface SdkFeatures {
  features: string[];
  patterns: Record<string, string[]>;
  isPremium: boolean;
  projectType: string;
  mediaFeatures: {
    allowedSources: string[];
    allowedViews: string[];
    comparisonModes: string[];
  };
}

// مدل محدودیت درخواست
export interface RequestLimit {
  monthly: number;
  remaining: number;
}

// مدل بسته
export interface Package {
  _id: string;
  userId: string | User;
  planId: string | Plan;
  startDate: string;
  endDate: string;
  token: string;
  sdkFeatures: SdkFeatures;
  requestLimit: RequestLimit;
  status: PackageStatus;
  notified: boolean;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی بسته‌ها
export interface PackageFilters {
  userId?: string;
  planId?: string;
  status?: PackageStatus;
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد بسته توسط ادمین
export interface CreatePackageRequest {
  userId: string;
  planId: string;
  duration?: number;
  sdkFeatures?: SdkFeatures;
}

// مدل درخواست به‌روزرسانی ویژگی‌های SDK
export interface UpdateSdkFeaturesRequest {
  features?: string[];
  patterns?: Record<string, string[]>;
  isPremium?: boolean;
  projectType?: string;
  mediaFeatures?: {
    allowedSources?: string[];
    allowedViews?: string[];
    comparisonModes?: string[];
  };
}

// مدل درخواست تمدید بسته
export interface ExtendPackageRequest {
  days: number;
}

// تایپ پاسخ صفحه‌بندی شده بسته‌ها
export type PaginatedPackages = PaginatedResponse<Package>;
