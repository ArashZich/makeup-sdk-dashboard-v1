// src/api/types/users.types.ts - اضافه کردن تایپ‌های جدید

import { PaginatedResponse } from "@/types/common.types";

export interface DivarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// انواع پلتفرم‌ها
export type PlatformType = "divar" | "salam" | "otp" | "web" | "api" | "admin";

// مدل کاربر اصلی - Updated
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
  platform: PlatformType; // ✅ تایپ شده
  oauthProvider?: string; // ✅ اضافه شده
  oauthId?: string; // ✅ اضافه شده
  allowedDomains?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
  divarTokens?: DivarTokens;
}

// ✅ تایپ‌های جدید برای SDK Features
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

// تایپ‌های موجود قبلی - Updated
export interface UserFilters {
  name?: string;
  phone?: string;
  role?: "user" | "admin";
  platform?: PlatformType; // ✅ اضافه شده
  verified?: boolean; // ✅ اضافه شده
  page?: number;
  limit?: number;
  sortBy?: string; // ✅ اضافه شده
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
  platform?: PlatformType; // ✅ اضافه شده
  allowedDomains?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
}

// ✅ تایپ جدید برای به‌روزرسانی اطلاعات ضروری
export interface UpdateRequiredInfoRequest {
  userType: "real" | "legal";
  nationalId: string;
}

export interface UpdateRequiredInfoResponse {
  message: string;
  user: Pick<User, "_id" | "name" | "userType" | "nationalId">;
}

export interface UpdateUserRequest extends UpdateProfileRequest {
  role?: "user" | "admin";
  phone?: string; // ✅ ادمین می‌تواند شماره تلفن تغییر دهد
  platform?: PlatformType; // ✅ ادمین می‌تواند پلتفرم تغییر دهد
}

export type PaginatedUsers = PaginatedResponse<User>;
