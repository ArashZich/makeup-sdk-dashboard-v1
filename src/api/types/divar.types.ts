// src/api/types/divar.types.ts
import { PaginatedResponse } from "@/types/common.types";

// تایپ آگهی دیوار
export interface DivarPost {
  token: string;
  title: string;
  category: string;
  hasMakeupVirtualTryOn?: boolean;
}

// فیلترهای جستجوی آگهی‌های دیوار
export interface DivarPostFilters {
  status?: "active" | "inactive" | "expired";
  hasMakeupVirtualTryOn?: boolean;
  page?: number;
  limit?: number;
}

// درخواست افزودن ویجت به آگهی دیوار
export interface AddDivarAddonRequest {
  product_id: string;
}

// پاسخ افزودن ویجت به آگهی دیوار
export interface AddDivarAddonResponse {
  success: boolean;
  message: string;
  post?: DivarPost;
}

// پاسخ صفحه‌بندی شده آگهی‌های دیوار
export type PaginatedDivarPosts = PaginatedResponse<DivarPost>;
