// src/api/types/products.types.ts
import { PaginatedResponse } from "@/types/common.types";

// ✅ تایپ‌های محصول یکپارچه شده با constants
export type ProductType =
  | "lips"
  | "eyeshadow"
  | "eyepencil"
  | "eyeliner"
  | "eyelashes"
  | "blush"
  | "concealer"
  | "foundation"
  | "brows";

// مدل الگو - ساده‌سازی شده
export interface Pattern {
  name: string; // همان کد pattern (مثل "normal", "matte")
  code: string; // همان name
  imageUrl?: string; // اختیاری شده
}

// مدل رنگ
export interface Color {
  name: string;
  hexCode: string;
  imageUrl?: string; // اختیاری شده
}

// مدل محصول
export interface Product {
  _id: string;
  userId: string;
  name: string;
  description: string;
  type: ProductType; // ✅ تایپ یکپارچه شده
  code: string;
  uid: string;
  thumbnail?: string; // اختیاری شده
  patterns: Pattern[];
  colors: Color[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی محصولات
export interface ProductFilters {
  active?: boolean;
  type?: ProductType; // ✅ تایپ یکپارچه شده
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد محصول
export interface CreateProductRequest {
  name: string;
  description?: string;
  type: ProductType; // ✅ تایپ یکپارچه شده
  code: string;
  thumbnail?: string; // اختیاری شده
  patterns: Pattern[];
  colors: Color[];
  active: boolean;
}

// مدل درخواست به‌روزرسانی محصول
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  thumbnail?: string;
  patterns?: Pattern[];
  colors?: Color[];
  active?: boolean;
}

// تایپ پاسخ صفحه‌بندی شده محصولات
export type PaginatedProducts = PaginatedResponse<Product>;
