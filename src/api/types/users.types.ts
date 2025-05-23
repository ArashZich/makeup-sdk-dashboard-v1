// src/api/types/users.types.ts - اضافه کردن تایپ‌های جدید

// تایپ‌های موجود قبلی + تایپ‌های جدید SDK Features

import { PaginatedResponse } from "@/types/common.types";

export interface DivarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// مدل کاربر اصلی (بدون تغییر)
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  role: "user" | "admin";
  verified: boolean;
  userType?: "real" | "legal";
  nationalId?: string;
  allowedDomains?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
  divarTokens?: DivarTokens;
}

// تایپ‌های جدید برای SDK Features
export interface MakeupFeature {
  type:
    | "lips"
    | "eyeshadow"
    | "eyepencil"
    | "eyeliner"
    | "eyelashes"
    | "blush"
    | "concealer"
    | "foundation"
    | "brows"
    | "lens";
  patterns: string[];
}

export interface MediaFeatures {
  allowedSources: string[];
  allowedViews: string[];
  comparisonModes: string[];
}

export interface PackageInfo {
  planName: string;
  endDate: string;
  requestLimit: {
    monthly: number;
    remaining: number;
  };
}

// پاسخ API دریافت ویژگی‌های SDK - کاربر با بسته فعال
export interface UserSdkFeaturesWithPackage {
  features: MakeupFeature[];
  isPremium: boolean;
  projectType: string;
  mediaFeatures: MediaFeatures;
  hasActivePackage: true;
  packageInfo: PackageInfo;
}

// پاسخ API دریافت ویژگی‌های SDK - کاربر بدون بسته فعال
export interface UserSdkFeaturesWithoutPackage {
  features: [];
  isPremium: false;
  projectType: "none";
  mediaFeatures: {
    allowedSources: [];
    allowedViews: [];
    comparisonModes: [];
  };
  hasActivePackage: false;
  message: string;
}

// تایپ اصلی پاسخ API
export type UserSdkFeaturesResponse =
  | UserSdkFeaturesWithPackage
  | UserSdkFeaturesWithoutPackage;

// تایپ‌های موجود قبلی (بدون تغییر)
export interface UserFilters {
  name?: string;
  phone?: string;
  role?: "user" | "admin";
  page?: number;
  limit?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  company?: string;
  userType?: "real" | "legal";
  nationalId?: string;
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
}

export interface UpdateDomainsRequest {
  domains: string[];
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  role?: "user" | "admin";
  userType?: "real" | "legal";
  nationalId?: string;
  allowedDomains?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
}

export interface UpdateUserRequest extends UpdateProfileRequest {
  role?: "user" | "admin";
}

export type PaginatedUsers = PaginatedResponse<User>;
