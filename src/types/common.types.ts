// src/types/common.types.ts

// مدل پاسخ صفحه‌بندی شده
export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// مدل فیلترهای صفحه‌بندی
export interface PaginationFilter {
  page?: number;
  limit?: number;
}

// مدل فیلترهای عمومی
export interface CommonFilters extends PaginationFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// تایپ‌های مربوط به پاسخ‌های API
export type ApiResponse<T> = {
  data: T;
  message?: string;
  status: number;
};

// تایپ‌های مربوط به خطاهای API
export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
};

// تایپ‌های مربوط به وضعیت درخواست
export type RequestStatus = "idle" | "loading" | "success" | "error";

// تایپ‌های مربوط به وضعیت پرداخت
export type PaymentStatus = "pending" | "success" | "failed" | "canceled";

// تایپ‌های مربوط به وضعیت بسته
export type PackageStatus = "active" | "expired" | "suspended";

// انواع اطلاعیه
export type NotificationType = "expiry" | "payment" | "system" | "other";
