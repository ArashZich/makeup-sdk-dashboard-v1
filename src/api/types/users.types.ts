// src/api/types/users.types.ts
import { PaginatedResponse } from "@/types/common.types";

export interface DivarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // به صورت ISO string
}
// مدل کاربر در این فایل با مدل کاربر در auth.types.ts مشترک است
// اما برای جلوگیری از وابستگی چرخشی، آن را اینجا هم تعریف می‌کنیم
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

// فیلترهای جستجوی کاربران
export interface UserFilters {
  name?: string;
  phone?: string;
  role?: "user" | "admin";
  page?: number;
  limit?: number;
}

// مدل درخواست به‌روزرسانی پروفایل
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

// مدل درخواست به‌روزرسانی دامنه‌های مجاز
export interface UpdateDomainsRequest {
  domains: string[];
}

// مدل درخواست ایجاد کاربر جدید (توسط ادمین)
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

// مدل درخواست به‌روزرسانی کاربر (توسط ادمین)
export interface UpdateUserRequest extends UpdateProfileRequest {
  role?: "user" | "admin";
}

// تایپ پاسخ صفحه‌بندی شده کاربران
export type PaginatedUsers = PaginatedResponse<User>;
