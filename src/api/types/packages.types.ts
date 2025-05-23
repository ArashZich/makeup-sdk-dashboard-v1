// src/api/types/packages.types.ts - آپدیت شده
import { PaginatedResponse } from "@/types/common.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";

// نوع وضعیت بسته
export type PackageStatus = "active" | "expired" | "suspended";

// انواع پلتفرم خرید - فیلد جدید
export type PurchasePlatform = "normal" | "divar" | "torob" | "basalam";

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

// مدل بسته - آپدیت شده با purchasePlatform
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
  purchasePlatform: PurchasePlatform; // فیلد جدید اضافه شده
  notified: boolean;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی بسته‌ها - آپدیت شده
export interface PackageFilters {
  userId?: string;
  planId?: string;
  status?: PackageStatus;
  purchasePlatform?: PurchasePlatform; // فیلتر جدید اضافه شده
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد بسته توسط ادمین - آپدیت شده
export interface CreatePackageRequest {
  userId: string;
  planId: string;
  duration?: number;
  purchasePlatform?: PurchasePlatform; // فیلد جدید اضافه شده
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
